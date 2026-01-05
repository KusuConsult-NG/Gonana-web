import { NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function POST(req: Request) {
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
        const { name, description, price, quantity, unit, location, category, deliveryMode, images } = body;

        // Use authenticated user ID
        const sellerId = decodedToken.uid;
        const sellerName = decodedToken.name || decodedToken.email || "Unknown Seller";

        const productData = {
            sellerId,
            sellerName,
            name,
            description,
            price: parseFloat(price),
            quantity: parseFloat(quantity),
            unit,
            location,
            category: category || "General",
            deliveryMode: deliveryMode || "logistics",
            images: images || [],
            currency: "NGN",
            isApproved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Add to Firestore
        const productRef = await adminDb.collection('products').add(productData);

        return NextResponse.json({
            id: productRef.id,
            ...productData
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const productsSnapshot = await adminDb
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
