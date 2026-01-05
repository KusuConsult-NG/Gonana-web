import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getExchangeRates } from "@/lib/exchangeRates";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const { items, paymentMethod, shippingMethod, walletCurrency, network } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        let totalAmountNGN = 0;
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

            totalAmountNGN += product.price * item.quantity;
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
        totalAmountNGN += shippingCost;

        // Fetch live exchange rates (cached for 5 minutes)
        const EXCHANGE_RATES = await getExchangeRates();

        // Determine payment details
        let amountToDeduct = totalAmountNGN;
        let currencyToDeduct = "NGN";
        let walletField = "balanceNGN";

        if (paymentMethod === "wallet" && walletCurrency && walletCurrency !== "NGN") {
            const totalInUSD = totalAmountNGN * EXCHANGE_RATES.NGN_USD;
            currencyToDeduct = walletCurrency;

            switch (walletCurrency) {
                case "USDT":
                case "USDC":
                    amountToDeduct = totalInUSD;
                    walletField = walletCurrency === "USDT" ? "balanceUSDT" : "balanceUSDC";
                    break;
                case "ETH":
                    amountToDeduct = totalInUSD / EXCHANGE_RATES.ETH_USD;
                    walletField = "balanceETH";
                    break;
                case "BNB":
                    amountToDeduct = totalInUSD / EXCHANGE_RATES.BNB_USD;
                    walletField = "balanceBNB";
                    break;
                case "MATIC":
                    amountToDeduct = totalInUSD / EXCHANGE_RATES.MATIC_USD;
                    walletField = "balanceMATIC";
                    break;
                default:
                    return NextResponse.json({ error: "Unsupported wallet currency" }, { status: 400 });
            }
        }

        // Get wallet
        const walletRef = adminDb.collection('wallets').doc(userId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        const wallet = walletDoc.data()!;
        const currentBalance = wallet[walletField] || 0;

        // Check balance
        if (currentBalance < amountToDeduct) {
            return NextResponse.json({
                error: `Insufficient ${currencyToDeduct} balance. Required: ${amountToDeduct.toFixed(6)}, Available: ${currentBalance.toFixed(6)}`
            }, { status: 400 });
        }

        // Create order
        const orderData = {
            buyerId: userId,
            items: orderItems,
            totalAmount: totalAmountNGN, // Always store base value in NGN
            shippingCost,
            currency: "NGN",
            paymentCurrency: currencyToDeduct,
            paymentAmount: amountToDeduct,
            status: "PAID",
            paymentMethod: paymentMethod || "wallet",
            paymentReference: `ORD-${Date.now()}`,
            shippingMethod: shippingMethod || "logistics",
            network: network || "n/a",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const orderRef = await adminDb.collection('orders').add(orderData);

        // Deduct from wallet
        const updateData: any = {
            updatedAt: new Date().toISOString()
        };
        updateData[walletField] = currentBalance - amountToDeduct;

        await walletRef.update(updateData);

        // Log transaction
        await adminDb.collection('transactions').add({
            walletId: userId,
            type: "PAYMENT",
            amount: amountToDeduct,
            currency: currencyToDeduct,
            status: "COMPLETED",
            reference: orderData.paymentReference,
            description: `Order payment for ${orderItems.length} item(s)`,
            orderId: orderRef.id,
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
