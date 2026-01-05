import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/change-password
 * Change user password
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

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "New password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        // Get user document from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        // Verify current password
        if (!userData?.password) {
            return NextResponse.json(
                { error: "Password authentication not set up. Please use social login or reset password." },
                { status: 400 }
            );
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in Firestore
        await adminDb.collection('users').doc(userId).update({
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
        });

        // Update password in Firebase Auth (if using email/password)
        try {
            await adminAuth.updateUser(userId, {
                password: newPassword,
            });
        } catch (authError) {
            console.log("Firebase Auth password update skipped (user may be using social login)");
        }

        return NextResponse.json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json(
            { error: "Failed to change password" },
            { status: 500 }
        );
    }
}
