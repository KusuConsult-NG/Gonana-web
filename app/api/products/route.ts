import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, price, quantity, unit, location, category, deliveryMode, images } = body;

        // For now, create products without auth (will add Firebase auth later)
        // TODO: Get actual user ID from Firebase Auth token
        const sellerId = "anonymous";
        const sellerName = "Test Seller";

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
        console.error("Product creation error:", error);
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
        console.error("Products fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
