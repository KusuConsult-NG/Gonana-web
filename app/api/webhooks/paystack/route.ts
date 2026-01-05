import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * Paystack Webhook Handler
 * POST /api/webhooks/paystack
 * 
 * Handles async payment notifications from Paystack
 * Documentation: https://paystack.com/docs/payments/webhooks/
 */
export async function POST(req: NextRequest) {
    try {
        // Verify webhook signature
        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(await req.clone().json()))
            .digest("hex");

        const paystackSignature = req.headers.get("x-paystack-signature");

        if (hash !== paystackSignature) {
            console.error("Invalid Paystack webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Parse webhook payload
        const body = await req.json();
        const event = body.event;
        const data = body.data;

        console.log(`[Paystack Webhook] Event: ${event}`, data);

        // Handle different event types
        switch (event) {
            case "charge.success":
                await handleChargeSuccess(data);
                break;

            case "transfer.success":
                await handleTransferSuccess(data);
                break;

            case "transfer.failed":
                await handleTransferFailed(data);
                break;

            default:
                console.log(`[Paystack Webhook] Unhandled event: ${event}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[Paystack Webhook] Error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * Handle successful payment charge
 */
async function handleChargeSuccess(data: any) {
    const reference = data.reference;
    const amount = data.amount / 100; // Convert from kobo to Naira
    const currency = data.currency;
    const customerEmail = data.customer?.email;
    const metadata = data.metadata || {};

    console.log(`[Charge Success] ${reference}: ${amount} ${currency}`);

    // Check if this is a wallet top-up
    if (metadata.type === "wallet_topup" && metadata.userId) {
        const userId = metadata.userId;
        const topupCurrency = metadata.currency || "NGN";

        // Update wallet balance
        const walletRef = adminDb.collection("wallets").doc(userId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            console.error(`[Charge Success] Wallet not found for user: ${userId}`);
            return;
        }

        const walletData = walletDoc.data()!;
        const walletField = `balance${topupCurrency}`;
        const currentBalance = walletData[walletField] || 0;

        await walletRef.update({
            [walletField]: currentBalance + amount,
            updatedAt: new Date().toISOString(),
        });

        // Log transaction
        await adminDb.collection("transactions").add({
            walletId: userId,
            type: "DEPOSIT",
            amount,
            currency: topupCurrency,
            status: "COMPLETED",
            reference,
            description: `Wallet top-up via Paystack`,
            paystackReference: reference,
            createdAt: new Date().toISOString(),
        });

        console.log(`[Charge Success] Wallet topped up: ${userId} +${amount} ${topupCurrency}`);
    }

    // Check if this is an order payment
    if (metadata.type === "order_payment" && metadata.orderId) {
        const orderId = metadata.orderId;

        // Update order status
        const orderRef = adminDb.collection("orders").doc(orderId);
        await orderRef.update({
            status: "PAID",
            paymentStatus: "completed",
            paymentReference: reference,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        console.log(`[Charge Success] Order paid: ${orderId}`);
    }
}

/**
 * Handle successful transfer (withdrawal)
 */
async function handleTransferSuccess(data: any) {
    const reference = data.reference;
    const amount = data.amount / 100;
    const recipient = data.recipient;

    console.log(`[Transfer Success] ${reference}: ${amount} to ${recipient}`);

    // Find and update withdrawal transaction
    const transactionsSnapshot = await adminDb
        .collection("transactions")
        .where("reference", "==", reference)
        .limit(1)
        .get();

    if (!transactionsSnapshot.empty) {
        const transactionDoc = transactionsSnapshot.docs[0];
        await transactionDoc.ref.update({
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
        });

        console.log(`[Transfer Success] Transaction updated: ${transactionDoc.id}`);
    }
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: any) {
    const reference = data.reference;
    const reason = data.reason || "Unknown error";

    console.error(`[Transfer Failed] ${reference}: ${reason}`);

    // Find and update transaction
    const transactionsSnapshot = await adminDb
        .collection("transactions")
        .where("reference", "==", reference)
        .limit(1)
        .get();

    if (!transactionsSnapshot.empty) {
        const transactionDoc = transactionsSnapshot.docs[0];
        const transactionData = transactionDoc.data();

        await transactionDoc.ref.update({
            status: "FAILED",
            failureReason: reason,
            failedAt: new Date().toISOString(),
        });

        // Refund amount to wallet if it was a withdrawal
        if (transactionData.type === "WITHDRAWAL") {
            const walletRef = adminDb.collection("wallets").doc(transactionData.walletId);
            const walletDoc = await walletRef.get();

            if (walletDoc.exists) {
                const walletData = walletDoc.data()!;
                const walletField = `balance${transactionData.currency}`;
                const currentBalance = walletData[walletField] || 0;

                await walletRef.update({
                    [walletField]: currentBalance + transactionData.amount,
                    updatedAt: new Date().toISOString(),
                });

                console.log(`[Transfer Failed] Refunded to wallet: ${transactionData.walletId}`);
            }
        }
    }
}
