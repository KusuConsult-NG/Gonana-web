import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * POST /api/logistics/book
 * Book a shipment
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

        const body = await req.json();
        const {
            pickupName,
            pickupPhone,
            pickupAddress,
            pickupCity,
            pickupState,
            deliveryName,
            deliveryPhone,
            deliveryAddress,
            deliveryCity,
            deliveryState,
            packageType,
            weight,
            quantity,
            description,
            value,
            shippingSpeed,
            deliveryDate,
        } = body;

        // Generate tracking ID
        const trackingId = `GLS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Calculate estimated cost based on weight and speed
        const baseRate = shippingSpeed === "express" ? 4500 : 2500;
        const weightCharge = parseFloat(weight) * 50; // ₦50 per kg
        const estimatedCost = baseRate + weightCharge;

        // Create shipment document
        const shipmentData = {
            userId: session.user.id,
            trackingId,
            status: "pending_pickup",

            pickup: {
                name: pickupName,
                phone: pickupPhone,
                address: pickupAddress,
                city: pickupCity,
                state: pickupState,
            },

            delivery: {
                name: deliveryName,
                phone: deliveryPhone,
                address: deliveryAddress,
                city: deliveryCity,
                state: deliveryState,
            },

            package: {
                type: packageType,
                weight: parseFloat(weight),
                quantity: parseInt(quantity),
                description,
                value: parseFloat(value),
            },

            shipping: {
                speed: shippingSpeed,
                preferredDate: deliveryDate || null,
                estimatedCost,
            },

            timeline: [
                {
                    status: "pending_pickup",
                    timestamp: new Date().toISOString(),
                    location: `${pickupCity}, ${pickupState}`,
                    description: "Shipment booking confirmed",
                }
            ],

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const shipmentRef = await adminDb.collection('shipments').add(shipmentData);

        return NextResponse.json({
            id: shipmentRef.id,
            trackingId,
            estimatedCost,
            message: "Shipment booked successfully",
        });
    } catch (error) {
        console.error("Shipment booking error:", error);
        return NextResponse.json(
            { error: "Failed to book shipment" },
            { status: 500 }
        );
    }
}
