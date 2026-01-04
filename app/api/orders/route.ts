
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { items, logistics: _logistics, paymentMethod, paymentReference, walletCurrency } = body;

        // 1. Calculate Total & Verify Stock
        let calculatedTotal = 0;
        const orderItemsData: any[] = []; // Using any[] to bypass strict typing for MVP, but logically correct structure for Prisma

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.id } });
            if (!product) throw new Error(`Product ${item.name} not found`);

            if (product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            calculatedTotal += product.price * item.quantity;
            orderItemsData.push({
                product: { connect: { id: product.id } },
                quantity: item.quantity,
                price: product.price
            });
        }

        // Add shipping cost (Mock logic)
        const shippingCost = _logistics === "topship" ? 2500 : 1500;
        calculatedTotal += shippingCost;
        // Verify total matches client (allow small margin or just use server total)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { wallet: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 3. Process Payment
        const result = await prisma.$transaction(async (tx: any) => {
            // Handle Wallet Payment
            if (paymentMethod === "wallet") {
                if (!user.wallet) throw new Error("Wallet not found");

                // Assuming NGN for now, or use walletCurrency logic
                if (user.wallet.balanceNGN < calculatedTotal) {
                    throw new Error("Insufficient wallet funds");
                }

                await tx.wallet.update({
                    where: { id: user.wallet.id },
                    data: { balanceNGN: { decrement: calculatedTotal } }
                });

                await tx.walletTransaction.create({
                    data: {
                        walletId: user.wallet.id,
                        type: "PAYMENT",
                        amount: calculatedTotal,
                        currency: "NGN",
                        status: "COMPLETED",
                        reference: `ORD-${Date.now()}`
                    }
                });
            }
            // Handle Paystack Payment (Already paid on client, we just record reference)
            else if (paymentMethod === "paystack") {
                if (!paymentReference) throw new Error("Missing payment reference");
                // In a real app, verify reference with Paystack API here using secret key
                // await verifyPaystack(paymentReference); 
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    buyerId: user.id,
                    totalAmount: calculatedTotal,
                    currency: "NGN",
                    status: "PAID",
                    paymentReference: paymentReference || `WALLET-${Date.now()}`,
                    paymentMethod: paymentMethod,
                    items: {
                        create: orderItemsData
                    }
                }
            });

            // Update Product Stock
            for (const item of orderItemsData) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: { decrement: item.quantity } }
                });
            }

            return order;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ error: error.message || "Order Failed" }, { status: 500 });
    }
}
