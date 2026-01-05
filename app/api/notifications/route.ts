import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/notifications
 * Get user's notifications
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

        // Get notifications for this user
        const notificationsSnapshot = await adminDb
            .collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { notificationId, read } = await req.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        // Update notification
        await adminDb
            .collection('notifications')
            .doc(notificationId)
            .update({
                read: read ?? true,
                updatedAt: new Date().toISOString()
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update notification error:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}
