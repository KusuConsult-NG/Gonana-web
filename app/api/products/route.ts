
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, price, quantity, unit, location, category, deliveryMode, images } = body;

        // Find user by email to get ID (Adapter uses IDs)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const product = await prisma.product.create({
            data: {
                sellerId: user.id,
                name,
                description,
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                unit,
                location,
                category,
                deliveryMode,
                images: JSON.stringify(images), // Store as JSON string
                currency: "NGN", // Default
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { seller: { select: { name: true } } }
        });
        return NextResponse.json(products);
    } catch {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
