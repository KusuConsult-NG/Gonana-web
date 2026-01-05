import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function PUT(req: Request) {
    // TODO: Add Firebase auth check
    // For now, allow updates without auth

    try {
        const body = await req.json();
        const { userId, name } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Update user document in Firestore
        await adminDb.collection('users').doc(userId).update({
            name,
            updatedAt: new Date().toISOString(),
        });

        // Get updated user
        const userDoc = await adminDb.collection('users').doc(userId).get();

        return NextResponse.json({
            id: userDoc.id,
            ...userDoc.data()
        });
    } catch (error) {
        console.error("User update error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
