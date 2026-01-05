import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    // TODO: Add Firebase auth check
    // For now, allow top-ups without auth

    try {
        const body = await req.json();
        const { userId, amount, currency } = body;

        if (!userId || !amount || !currency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get wallet document
        const walletRef = adminDb.collection('wallets').doc(userId);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        const walletData = walletDoc.data()!;
        const amountNum = parseFloat(amount);

        // Update balance based on currency
        const updates: any = {
            updatedAt: new Date().toISOString()
        };

        switch (currency) {
            case "NGN":
                updates.balanceNGN = (walletData.balanceNGN || 0) + amountNum;
                break;
            case "USD":
                updates.balanceUSD = (walletData.balanceUSD || 0) + amountNum;
                break;
            case "USDT":
                updates.balanceUSDT = (walletData.balanceUSDT || 0) + amountNum;
                break;
            case "USDC":
                updates.balanceUSDC = (walletData.balanceUSDC || 0) + amountNum;
                break;
        }

        await walletRef.update(updates);

        // Log transaction
        await adminDb.collection('transactions').add({
            walletId: userId,
            type: "DEPOSIT",
            amount: amountNum,
            currency,
            status: "COMPLETED",
            createdAt: new Date().toISOString(),
        });

        // Get updated wallet
        const updatedWallet = await walletRef.get();

        return NextResponse.json({
            id: updatedWallet.id,
            ...updatedWallet.data()
        });
    } catch (error) {
        console.error("Top-up error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
