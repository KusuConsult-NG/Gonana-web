"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ShoppingCart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/PriceTag";

interface Product {
    id: string | number;
    name: string;
    description: string;
    price: number;
    unit: string;
    seller: string | { name: string }; // Handle both string (mock) and object (real)
    verified?: boolean;
    rating?: number;
    image: string | string[]; // Handle string url or array of strings
    tag?: string | null;
    colors?: string;
    minOrder?: string;
    payment?: string;
    currency?: string;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const sellerName = typeof product.seller === 'object' ? product.seller.name : product.seller;
    const imageUrl = typeof product.image === 'string' ? product.image : (product.image && product.image[0]) ? product.image[0] : "";

    return (
        <Link href={`/product/${product.id}`} className="group bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                {product.tag && (
                    <span className={cn("absolute top-3 left-3 z-10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide", product.colors || "bg-primary/90")}>
                        {product.tag}
                    </span>
                )}
                <button className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 text-gray-400 hover:text-red-500 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
                    <Heart className="h-5 w-5" />
                </button>
                <Image
                    src={imageUrl || "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800"} // Fallback
                    alt={product.name}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-semibold text-lg text-text-light dark:text-text-dark group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex items-center text-yellow-500 text-xs flex-shrink-0 ml-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 font-medium text-text-light dark:text-text-dark">{product.rating || "NEW"}</span>
                    </div>
                </div>
                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mb-4 line-clamp-2">{product.description}</p>

                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-xs">
                            {sellerName ? sellerName.charAt(0) : "S"}
                        </div>
                        <span className="text-xs font-medium text-text-light dark:text-text-dark truncate max-w-[100px]">{sellerName}</span>
                        {product.verified && <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                        <div className="flex flex-col">
                            <PriceTag amount={product.price} currency={(product.currency as "NGN" | "USD" | "USDT" | "USDC") || "NGN"} />
                            <span className="text-xs font-normal text-secondary-text-light dark:text-secondary-text-dark mt-0.5">{product.unit || "/ unit"}</span>
                        </div>
                        <button className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all z-20" onClick={(e) => {
                            e.preventDefault();
                            // Add to cart logic would go here
                        }}>
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
