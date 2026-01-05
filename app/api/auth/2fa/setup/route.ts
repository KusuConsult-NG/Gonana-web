import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { encryptPrivateKey } from '@/lib/crypto/walletGenerator';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Generate secret
        const secret = authenticator.generateSecret();

        // Generate OTP Auth URL
        const otpauth = authenticator.keyuri(
            `user-${userId.substring(0, 6)}`, // label with partial ID
            'Gonana Marketplace', // issuer
            secret
        );

        const qrCode = await QRCode.toDataURL(otpauth);

        // Encrypt secret using our secure wallet encryption
        const encryptedSecret = await encryptPrivateKey(secret, userId);

        // Save to user doc (not enabled yet)
        await adminDb.collection('users').doc(userId).set({
            twoFactorSecret: encryptedSecret,
            twoFactorPending: true // Flag to indicate setup in progress
        }, { merge: true });

        return NextResponse.json({
            secret,
            qrCode
        });

    } catch (error) {
        console.error('2FA setup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
