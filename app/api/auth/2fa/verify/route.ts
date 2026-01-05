import { authenticator } from 'otplib';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { decryptPrivateKeyAsync } from '@/lib/crypto/walletGenerator';
import crypto from 'crypto';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { checkRateLimit } from '@/lib/rateLimit';

function hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: Request) {
    try {
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const rl = await checkRateLimit(ip, 'auth');
        if (!rl.success) return NextResponse.json({ error: rl.reason }, { status: 429 });

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 });
        }

        // Get user data
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.twoFactorSecret) {
            return NextResponse.json({ error: '2FA not initialized. Please setup first.' }, { status: 400 });
        }

        // Decrypt secret
        // Decrypt secret
        const secret = await decryptPrivateKeyAsync(
            userData.twoFactorSecret.encryptedData,
            userData.twoFactorSecret.iv,
            userData.twoFactorSecret.salt,
            userData.twoFactorSecret.authTag,
            userId,
            userData.twoFactorSecret.keyVersion
        );

        // Verify code
        const isValid = authenticator.verify({ token: code, secret });

        if (isValid) {
            // Generate 10 backup codes
            const backupCodes = Array(10).fill(0).map(() =>
                crypto.randomBytes(4).toString('hex').toUpperCase()
            );

            const hashedBackupCodes = backupCodes.map(hashBackupCode);

            await adminDb.collection('users').doc(userId).update({
                twoFactorEnabled: true,
                twoFactorPending: false,
                backupCodes: hashedBackupCodes,
                twoFactorUpdatedAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                backupCodes
            });
        } else {
            return NextResponse.json({ error: 'Invalid authentication code' }, { status: 400 });
        }

    } catch (error) {
        console.error('2FA verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
