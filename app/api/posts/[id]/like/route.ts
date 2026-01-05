
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const userId = session.user.id;
        const likeRef = adminDb.collection('posts').doc(id).collection('likes').doc(userId);
        const likeDoc = await likeRef.get();

        if (likeDoc.exists) {
            // Unlike
            await likeRef.delete();
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await likeRef.set({
                userId,
                createdAt: new Date().toISOString(),
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }
}
