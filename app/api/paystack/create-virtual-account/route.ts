import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * POST /api/paystack/create-virtual-account
 * Create a dedicated virtual account for a user
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { email, firstName, lastName, phone } = await req.json();

        if (!email || !firstName || !lastName) {
            return NextResponse.json(
                { error: "Email, first name, and last name are required" },
                { status: 400 }
            );
        }

        if (!PAYSTACK_SECRET_KEY) {
            return NextResponse.json(
                { error: "Paystack not configured" },
                { status: 500 }
            );
        }

        // Create a customer on Paystack first
        const customerResponse = await fetch('https://api.paystack.co/customer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                first_name: firstName,
                last_name: lastName,
                phone: phone || undefined
            })
        });

        const customerData = await customerResponse.json();

        if (!customerResponse.ok) {
            // Customer might already exist
            if (customerData.message?.includes('already exists')) {
                // Try to fetch existing customer
                const existingCustomer = await fetch(`https://api.paystack.co/customer/${email}`, {
                    headers: {
                        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    }
                });
                const existingData = await existingCustomer.json();
                if (existingData.status) {
                    customerData.data = existingData.data;
                } else {
                    throw new Error(customerData.message);
                }
            } else {
                throw new Error(customerData.message || 'Failed to create customer');
            }
        }

        const customerCode = customerData.data.customer_code;

        // Create dedicated virtual account
        const virtualAccountResponse = await fetch('https://api.paystack.co/dedicated_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer: customerCode,
                preferred_bank: 'wema-bank', // or 'titan-paystack'
            })
        });

        const virtualAccountData = await virtualAccountResponse.json();

        if (!virtualAccountResponse.ok) {
            throw new Error(virtualAccountData.message || 'Failed to create virtual account');
        }

        const accountDetails = {
            accountNumber: virtualAccountData.data.account_number,
            accountName: virtualAccountData.data.account_name,
            bankName: virtualAccountData.data.bank.name,
            bankCode: virtualAccountData.data.bank.id,
            customerCode: customerCode,
            createdAt: new Date().toISOString()
        };

        // Store in Firestore
        await adminDb.collection('users').doc(session.user.id).update({
            virtualAccount: accountDetails,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            account: accountDetails
        });
    } catch (error: any) {
        console.error("Virtual account creation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create virtual account" },
            { status: 500 }
        );
    }
}
