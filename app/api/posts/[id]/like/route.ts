
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
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId: user.id
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId: id,
                    userId: user.id
                }
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }
}
