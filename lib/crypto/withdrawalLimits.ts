import { adminDb } from "@/lib/firebase-admin";

interface WithdrawalLimits {
    daily: number; // USD value
    weekly: number; // USD value
    perTransaction: number; // USD value
}

// Limits configuration
const LIMITS: WithdrawalLimits = {
    daily: 10000, // $10k
    weekly: 50000, // $50k
    perTransaction: 5000, // $5k
};

export async function checkWithdrawalLimits(
    userId: string,
    amountUSD: number
): Promise<{ allowed: boolean; reason?: string }> {
    // Check per transaction limit
    if (amountUSD > LIMITS.perTransaction) {
        return { allowed: false, reason: `Amount exceeds per-transaction limit of $${LIMITS.perTransaction.toLocaleString()}` };
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const startOfWeek = oneWeekAgo.toISOString();

    // Fetch recent withdrawals
    // Note: This query requires a composite index if we filter by userId + type + createdAt
    // For now, fetching by userId and filtering in memory is okay for small scale, 
    // but ideally we query range on createdAt.

    const withdrawalsSnapshot = await adminDb
        .collection('cryptoTransactions')
        .where('userId', '==', userId)
        .where('type', '==', 'withdrawal')
        .where('status', 'in', ['pending', 'completed']) // Count pending too
        .where('createdAt', '>=', startOfWeek)
        .get();

    let dailyTotal = 0;
    let weeklyTotal = 0;

    withdrawalsSnapshot.forEach(doc => {
        const data = doc.data();
        const usdValue = data.amountUSD || 0;
        const createdAt = data.createdAt;

        if (createdAt >= startOfDay) {
            dailyTotal += usdValue;
        }
        weeklyTotal += usdValue;
    });

    if (dailyTotal + amountUSD > LIMITS.daily) {
        return {
            allowed: false,
            reason: `Daily limit of $${LIMITS.daily.toLocaleString()} exceeded. Remaining today: $${(LIMITS.daily - dailyTotal).toLocaleString()}`
        };
    }

    if (weeklyTotal + amountUSD > LIMITS.weekly) {
        return {
            allowed: false,
            reason: `Weekly limit of $${LIMITS.weekly.toLocaleString()} exceeded. Remaining this week: $${(LIMITS.weekly - weeklyTotal).toLocaleString()}`
        };
    }

    return { allowed: true };
}
