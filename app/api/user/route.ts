import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: userDoc.id,
            ...userDoc.data()
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const body = await req.json();
        const { firstName, lastName, bio, location, age, gender, image } = body;

        // Construct update object with only defined fields
        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (firstName && lastName) updateData.name = `${firstName} ${lastName}`;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (age) updateData.age = parseInt(age);
        if (gender) updateData.gender = gender;
        if (image) updateData.image = image; // Save profile picture URL

        await adminDb.collection('users').doc(userId).update(updateData);

        const userDoc = await adminDb.collection('users').doc(userId).get();

        return NextResponse.json({
            id: userDoc.id,
            ...userDoc.data()
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
