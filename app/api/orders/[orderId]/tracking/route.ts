import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { OrderStatus, TrackingEvent } from "@/lib/orderTracking";

/**
 * GET /api/orders/[orderId]/tracking
 * Get tracking information for an order
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Get order from Firestore
        const orderDoc = await adminDb.collection('orders').doc(orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data()!;

        // Return tracking information
        return NextResponse.json({
            trackingNumber: orderData.trackingNumber,
            orderStatus: orderData.orderStatus || orderData.status,
            estimatedDelivery: orderData.estimatedDelivery,
            trackingEvents: orderData.trackingEvents || [],
            shippingMethod: orderData.shippingMethod,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            currency: orderData.currency,
            createdAt: orderData.createdAt
        });
    } catch (error) {
        console.error("Error fetching tracking info:", error);
        return NextResponse.json(
            { error: "Failed to fetch tracking information" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/orders/[orderId]/tracking
 * Update order status and add tracking event
 * Requires authentication (seller or admin)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { orderId } = await params;
        const { status, location, description } = await req.json();

        // Validate status
        const validStatuses: OrderStatus[] = [
            'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
            'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
            'CANCELLED', 'REFUNDED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid order status" },
                { status: 400 }
            );
        }

        // Get order
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data()!;

        // Check if user is authorized (order owner or seller)
        // For now, we'll allow any authenticated user to update
        // In production, add proper authorization check

        // Create tracking event
        const trackingEvent: TrackingEvent = {
            status,
            location: location || "Nigeria",
            description: description || `Order status updated to ${status}`,
            timestamp: new Date().toISOString()
        };

        // Get existing events
        const existingEvents = orderData.trackingEvents || [];

        // Update order
        await orderRef.update({
            orderStatus: status,
            status: status, // Also update main status field
            trackingEvents: [...existingEvents, trackingEvent],
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: "Tracking updated successfully",
            trackingEvent
        });
    } catch (error) {
        console.error("Error updating tracking:", error);
        return NextResponse.json(
            { error: "Failed to update tracking" },
            { status: 500 }
        );
    }
}
