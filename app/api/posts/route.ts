
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        image: true,
                    }
                },
                likes: true,
                comments: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const formattedPosts = posts.map(post => ({
            id: post.id,
            author: post.author.name || "Anonymous",
            handle: "@" + (post.author.name?.replace(/\s+/g, "").toLowerCase() || "user"),
            time: new Date(post.createdAt).toLocaleDateString(), // simplified time
            content: post.content,
            image: post.image,
            likes: post.likes.length,
            comments: post.comments.length,
            avatar: post.author.image || "", // Use real avatar or empty string (frontend handles fallback)
            isLiked: false, // In a real app, check if session user liked it
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content, image } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId: user.id
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
