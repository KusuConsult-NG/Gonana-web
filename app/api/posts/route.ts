
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
    try {
        const postsSnapshot = await adminDb.collection('posts').orderBy('createdAt', 'desc').get();

        const formattedPosts = await Promise.all(postsSnapshot.docs.map(async (doc) => {
            const post = doc.data();

            // Get author details
            const authorDoc = await adminDb.collection('users').doc(post.authorId).get();
            const author = authorDoc.data();

            let authorName = author?.name;
            if (!authorName && author?.firstName) {
                authorName = `${author.firstName} ${author.lastName || ''}`.trim();
            }

            const displayAuthor = authorName || "Anonymous";

            // Get likes and comments count
            const likesSnapshot = await adminDb.collection('posts').doc(doc.id).collection('likes').get();
            const commentsSnapshot = await adminDb.collection('posts').doc(doc.id).collection('comments').get();

            return {
                id: doc.id,
                author: displayAuthor,
                handle: "@" + (displayAuthor.replace /\s+/g, "").toLowerCase() || "user"),
            time: new Date(post.createdAt).toLocaleDateString(),
                content: post.content,
                    image: post.image || null,
                        likes: likesSnapshot.size,
                            comments: commentsSnapshot.size,
                                avatar: author?.image || "",
                                    isLiked: false,
            };
}));

return NextResponse.json(formattedPosts);
    } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
}
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content, image } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const postData = {
            content,
            image: image || null,
            authorId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const postRef = await adminDb.collection('posts').add(postData);

        return NextResponse.json({ id: postRef.id, ...postData }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
