
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
        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

        const commentData = {
            content,
            authorId: session.user.id,
            createdAt: new Date().toISOString(),
        };

        const commentRef = await adminDb.collection('posts').doc(id).collection('comments').add(commentData);

        return NextResponse.json({ id: commentRef.id, ...commentData }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to comment" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const commentsSnapshot = await adminDb.collection('posts').doc(id).collection('comments')
            .orderBy('createdAt', 'desc')
            .get();

        const comments = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let authorName = "Unknown User";
            let authorImage = null;

            if (data.authorId) {
                const userDoc = await adminDb.collection('users').doc(data.authorId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    authorName = userData?.name || "Unknown User";
                    authorImage = userData?.image || null;
                }
            }

            return {
                id: doc.id,
                ...data,
                authorName,
                authorImage
            };
        }));

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}
