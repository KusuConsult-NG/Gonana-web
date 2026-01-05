import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/tracking/[trackingNumber]
 * Public endpoint to track order by tracking number
 * No authentication required
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ trackingNumber: string }> }
) {
    try {
        const { trackingNumber } = await params;

        // Search for order by tracking number
        const ordersSnapshot = await adminDb
            .collection('orders')
            .where('trackingNumber', '==', trackingNumber)
            .limit(1)
            .get();

        if (ordersSnapshot.empty) {
            return NextResponse.json(
                { error: "Tracking number not found" },
                { status: 404 }
            );
        }

        const orderDoc = ordersSnapshot.docs[0];
        const orderData = orderDoc.data();

        // Return limited tracking information (don't expose sensitive data)
        return NextResponse.json({
            trackingNumber: orderData.trackingNumber,
            orderStatus: orderData.orderStatus || orderData.status,
            estimatedDelivery: orderData.estimatedDelivery,
            trackingEvents: orderData.trackingEvents || [],
            shippingMethod: orderData.shippingMethod,
            createdAt: orderData.createdAt,
            // Don't expose: buyer info, payment details, exact items
        });
    } catch (error) {
        console.error("Error tracking order:", error);
        return NextResponse.json(
            { error: "Failed to track order" },
            { status: 500 }
        );
    }
}
