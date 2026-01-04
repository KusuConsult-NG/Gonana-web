
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
        const { amount, currency } = body;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { wallet: true }
        });

        if (!user || !user.wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

        // Update wallet balance
        const updatedWallet = await prisma.wallet.update({
            where: { id: user.wallet.id },
            data: {
                balanceNGN: currency === "NGN" ? { increment: parseFloat(amount) } : undefined,
                balanceUSD: currency === "USD" ? { increment: parseFloat(amount) } : undefined,
                balanceUSDT: currency === "USDT" ? { increment: parseFloat(amount) } : undefined,
                balanceUSDC: currency === "USDC" ? { increment: parseFloat(amount) } : undefined,
            }
        });

        // Log transaction
        await prisma.walletTransaction.create({
            data: {
                walletId: user.wallet.id,
                type: "DEPOSIT",
                amount: parseFloat(amount),
                currency,
                status: "COMPLETED",
            }
        });

        return NextResponse.json(updatedWallet);

    } catch (error) {
        console.error("Top-up error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
