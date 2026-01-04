
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: id,
                authorId: user.id
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to comment" }, { status: 500 });
    }
}
