import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function PUT(req: Request) {
    try {
        // Verify Firebase authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        // Use authenticated user ID
        const userId = decodedToken.uid;

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
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
