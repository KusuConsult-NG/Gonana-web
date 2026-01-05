import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, items, paymentMethod, shippingMethod } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        let totalAmount = 0;
        const orderItems: any[] = [];

        // Calculate total and verify products
        for (const item of items) {
            const productDoc = await adminDb.collection('products').doc(item.id.toString()).get();

            if (!productDoc.exists) {
                return NextResponse.json({ error: `Product ${item.name} not found` }, { status: 404 });
            }

            const product = productDoc.data()!;

            if (product.quantity < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${product.name}`
                }, { status: 400 });
            }

            totalAmount += product.price * item.quantity;
            orderItems.push({
                productId: item.id.toString(),
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                unit: product.unit || "kg"
            });
        }

        // Add shipping cost
        const shippingCost = shippingMethod === "logistics" ? 2500 : 0;
        totalAmount += shippingCost;

        // Get wallet
        const walletRef = adminDb.collection('wallets').doc(userId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        const wallet = walletDoc.data()!;

        // Check balance (assuming NGN for now)
        if (wallet.balanceNGN < totalAmount) {
            return NextResponse.json({
                error: "Insufficient wallet balance"
            }, { status: 400 });
        }

        // Create order
        const orderData = {
            buyerId: userId,
            items: orderItems,
            totalAmount,
            shippingCost,
            currency: "NGN",
            status: "PAID",
            paymentMethod: paymentMethod || "wallet",
            paymentReference: `ORD-${Date.now()}`,
            shippingMethod: shippingMethod || "logistics",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const orderRef = await adminDb.collection('orders').add(orderData);

        // Deduct from wallet
        await walletRef.update({
            balanceNGN: wallet.balanceNGN - totalAmount,
            updatedAt: new Date().toISOString()
        });

        // Log transaction
        await adminDb.collection('transactions').add({
            walletId: userId,
            type: "PAYMENT",
            amount: totalAmount,
            currency: "NGN",
            status: "COMPLETED",
            reference: orderData.paymentReference,
            description: `Order payment for ${orderItems.length} item(s)`,
            createdAt: new Date().toISOString()
        });

        // Update product quantities
        for (const item of orderItems) {
            const productRef = adminDb.collection('products').doc(item.productId);
            const productDoc = await productRef.get();
            const product = productDoc.data()!;

            await productRef.update({
                quantity: product.quantity - item.quantity,
                updatedAt: new Date().toISOString()
            });
        }

        return NextResponse.json({
            orderId: orderRef.id,
            ...orderData
        }, { status: 201 });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            error: error.message || "Order failed"
        }, { status: 500 });
    }
}
