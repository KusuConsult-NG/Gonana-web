import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { seller: { select: { name: true, isKycVerified: true, image: true } } }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}
