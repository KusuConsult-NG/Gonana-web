import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, price, quantity, unit, location, category, deliveryMode, images } = body;

        // Use authenticated user ID
        const sellerId = session.user.id;
        const sellerName = session.user.name || session.user.email || "Unknown Seller";

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
