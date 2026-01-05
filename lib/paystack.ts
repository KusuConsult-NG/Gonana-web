// Paystack Integration Utility
// Uses Paystack Popup JS (loaded via script tag in layout)

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export interface PaystackPaymentData {
    email: string;
    amount: number; // in kobo (smallest currency unit)
    currency?: "NGN" | "GHS" | "ZAR" | "USD";
    ref?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
    callback_url?: string;
}

export interface PaystackResponse {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
    message?: string;
}

/**
 * Initialize Paystack payment popup
 * @param data Payment data
 * @param onSuccess Callback on successful payment
 * @param onClose Callback when user closes popup
 */
export function initializePaystackPayment(
    data: PaystackPaymentData,
    onSuccess: (response: PaystackResponse) => void,
    onClose: () => void
) {
    interface PaystackPopType {
        setup: (options: Record<string, unknown>) => { openIframe: () => void };
    }

    // Check if PaystackPop is loaded
    if (typeof window === "undefined" || !(window as unknown as { PaystackPop: PaystackPopType }).PaystackPop) {
        console.error("Paystack script not loaded");
        alert("Payment system not ready. Please refresh and try again.");
        return;
    }

    const PaystackPop = (window as unknown as { PaystackPop: PaystackPopType }).PaystackPop;

    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: Math.round(data.amount), // Ensure it's in kobo/pesewas (smallest unit)
        currency: data.currency || "NGN",
        ref: data.ref || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        metadata: data.metadata || {},
        channels: data.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        callback: function (response: PaystackResponse) {
            // Payment successful
            onSuccess(response);
        },
        onClose: function () {
            // User closed popup
            onClose();
        },
    });

    handler.openIframe();
}

/**
 * Verify payment on backend
 * @param reference Payment reference
 */
export async function verifyPaystackPayment(reference: string): Promise<unknown> {
    try {
        const response = await fetch(`/api/payments/verify?reference=${reference}`);
        if (!response.ok) {
            throw new Error("Payment verification failed");
        }
        return await response.json();
    } catch (error) {
        console.error("Payment verification error:", error);
        throw error;
    }
}

/**
 * Convert amount to kobo (NGN smallest unit)
 * @param amount Amount in Naira
 */
export function convertToKobo(amount: number): number {
    return Math.round(amount * 100);
}

/**
 * Format amount from kobo to Naira
 * @param kobo Amount in kobo
 */
export function convertFromKobo(kobo: number): number {
    return kobo / 100;
}
