import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/users/[id]/follow
 * Follow/unfollow a user
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: targetUserId } = await params;
        const currentUserId = session.user.id;

        if (currentUserId === targetUserId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            );
        }

        const { action } = await req.json(); // 'follow' or 'unfollow'

        if (action === 'follow') {
            // Create follow relationship
            await adminDb.collection('follows').add({
                followerId: currentUserId,
                followingId: targetUserId,
                createdAt: new Date().toISOString()
            });

            // Update follower count for target user
            const targetUserRef = adminDb.collection('users').doc(targetUserId);
            const targetUserDoc = await targetUserRef.get();
            if (targetUserDoc.exists) {
                const currentFollowers = targetUserDoc.data()?.followersCount || 0;
                await targetUserRef.update({
                    followersCount: currentFollowers + 1
                });
            }

            // Update following count for current user
            const currentUserRef = adminDb.collection('users').doc(currentUserId);
            const currentUserDoc = await currentUserRef.get();
            if (currentUserDoc.exists) {
                const currentFollowing = currentUserDoc.data()?.followingCount || 0;
                await currentUserRef.update({
                    followingCount: currentFollowing + 1
                });
            }

            return NextResponse.json({ success: true, action: 'followed' });
        } else if (action === 'unfollow') {
            // Find and delete follow relationship
            const followsSnapshot = await adminDb
                .collection('follows')
                .where('followerId', '==', currentUserId)
                .where('followingId', '==', targetUserId)
                .limit(1)
                .get();

            if (!followsSnapshot.empty) {
                await followsSnapshot.docs[0].ref.delete();

                // Update follower count for target user
                const targetUserRef = adminDb.collection('users').doc(targetUserId);
                const targetUserDoc = await targetUserRef.get();
                if (targetUserDoc.exists) {
                    const currentFollowers = targetUserDoc.data()?.followersCount || 0;
                    await targetUserRef.update({
                        followersCount: Math.max(0, currentFollowers - 1)
                    });
                }

                // Update following count for current user
                const currentUserRef = adminDb.collection('users').doc(currentUserId);
                const currentUserDoc = await currentUserRef.get();
                if (currentUserDoc.exists) {
                    const currentFollowing = currentUserDoc.data()?.followingCount || 0;
                    await currentUserRef.update({
                        followingCount: Math.max(0, currentFollowing - 1)
                    });
                }
            }

            return NextResponse.json({ success: true, action: 'unfollowed' });
        } else {
            return NextResponse.json(
                { error: "Invalid action. Use 'follow' or 'unfollow'" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Follow/unfollow error:", error);
        return NextResponse.json(
            { error: "Failed to process follow action" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/users/[id]/follow
 * Check if current user follows target user and get counts
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id: targetUserId } = await params;
        const currentUserId = session.user.id;

        // Check if following
        const followsSnapshot = await adminDb
            .collection('follows')
            .where('followerId', '==', currentUserId)
            .where('followingId', '==', targetUserId)
            .limit(1)
            .get();

        const isFollowing = !followsSnapshot.empty;

        // Get user counts
        const userDoc = await adminDb.collection('users').doc(targetUserId).get();
        const userData = userDoc.data();

        return NextResponse.json({
            isFollowing,
            followersCount: userData?.followersCount || 0,
            followingCount: userData?.followingCount || 0
        });
    } catch (error) {
        console.error("Get follow status error:", error);
        return NextResponse.json(
            { error: "Failed to get follow status" },
            { status: 500 }
        );
    }
}
