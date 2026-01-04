
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                // Note: User model might not have bio/phone/location pending verification.
                // Checking usage: Settings page likely wants these.
                // If they don't exist, we should check schema. 
                // Earlier we found 'location' does NOT exist on User. 
                // So we can only update 'name' and 'image' generally, or other existing fields.
                // Let's assume for MVP we only update 'name'.
                // If schemas supported it, we'd add it.
            },
        });

        return NextResponse.json(updatedUser);
    } catch {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
