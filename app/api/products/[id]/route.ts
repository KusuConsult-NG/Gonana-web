import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;

    try {
        const productDoc = await adminDb.collection('products').doc(id).get();

        if (!productDoc.exists) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const product = {
            id: productDoc.id,
            ...productDoc.data()
        };

        return NextResponse.json(product);
    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}
