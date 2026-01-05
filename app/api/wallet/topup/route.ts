import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        // Verify Firebase authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
        }

        const authenticatedUserId = decodedToken.uid;

        const body = await req.json();
        const { amount, currency } = body;

        if (!amount || !currency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use authenticated user ID instead of user-provided ID
        const userId = authenticatedUserId;

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
