import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/transactions
 * Get user's transaction history
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get transactions for this wallet
        const transactionsSnapshot = await adminDb
            .collection('transactions')
            .where('walletId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Get transactions error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
