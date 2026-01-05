import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import bcrypt from "bcryptjs";

/**
 * Validate password strength with comprehensive checks
 */
function validatePasswordStrength(password: string): string[] {
    const errors: string[] = [];

    // Length check
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
        errors.push("Password must not exceed 128 characters");
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)) {
        errors.push("Password must contain at least one special character (!@#$%^&*...)");
    }

    // Check for common weak patterns
    const weakPatterns = [
        /^123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /(.)\1{2,}/ // repeated characters (aaa, 111, etc)
    ];

    for (const pattern of weakPatterns) {
        if (pattern.test(password)) {
            errors.push("Password contains weak or common patterns");
            break;
        }
    }

    return errors;
}

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

        // Comprehensive password validation
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            return NextResponse.json(
                { error: passwordErrors.join('. ') },
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
