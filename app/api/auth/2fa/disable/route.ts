import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";
import speakeasy from "speakeasy";

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for authenticated user
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { code } = await req.json();

        if (!code || code.length !== 6) {
            return NextResponse.json(
                { error: "Please provide a valid 6-digit code from your authenticator app" },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Get user's 2FA settings
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        if (!userData?.twoFactorEnabled) {
            return NextResponse.json(
                { error: "2FA is not enabled for this account" },
                { status: 400 }
            );
        }

        // Verify the code (you'd use speakeasy or similar library)
        // Verify the code with speakeasy
        const verified = speakeasy.totp.verify({
            secret: userData.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!verified) {
            return NextResponse.json(
                { error: "Invalid code. Please try again." },
                { status: 401 }
            );
        }

        // Disable 2FA
        await adminDb.collection('users').doc(userId).update({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: [],
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: "2FA has been disabled successfully",
        });
    } catch (error) {
        console.error("2FA disable error:", error);
        return NextResponse.json(
            { error: "Failed to disable 2FA" },
            { status: 500 }
        );
    }
}
