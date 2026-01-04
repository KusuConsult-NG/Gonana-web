import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
        return NextResponse.json(
            { error: "Payment reference is required" },
            { status: 400 }
        );
    }

    try {
        // Verify payment with Paystack API
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Payment verification failed", details: data },
                { status: 400 }
            );
        }

        // Check if payment was successful
        if (data.data.status === "success") {
            return NextResponse.json({
                verified: true,
                status: data.data.status,
                amount: data.data.amount / 100, // Convert from kobo to Naira
                currency: data.data.currency,
                reference: data.data.reference,
                metadata: data.data.metadata,
                paid_at: data.data.paid_at,
                customer: data.data.customer,
            });
        } else {
            return NextResponse.json(
                {
                    verified: false,
                    status: data.data.status,
                    message: "Payment was not successful",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Internal server error during payment verification" },
            { status: 500 }
        );
    }
}
