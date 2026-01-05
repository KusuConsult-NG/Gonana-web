"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, CheckCircle, Minus, Plus, ShoppingBag, Lock, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PriceTag } from "@/components/ui/PriceTag";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();

    interface Product {
        id: string | number;
        name: string;
        description: string;
        price: number;
        currency: string;
        images: string[];
        seller?: {
            name: string;
            location?: string;
            isKycVerified?: boolean;
        };
        location?: string;
        unit?: string;
        quantity?: number;
        category?: string;
        verified?: boolean;
        image?: string; // For related products
    }

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
            fetchRelatedProducts(); // Call fetchRelatedProducts here
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                // Firestore returns images as array already
                setProduct({ ...data, images: data.images || [] });
            } else {
                setError("Product not found");
            }
        } catch (err) {
            setError("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                // Filter out the current product and take a few random ones
                const filtered = data.filter((p: Product) => p.id !== params.id).sort(() => 0.5 - Math.random()).slice(0, 4);
                setRelatedProducts(filtered.map((p: Product) => ({
                    ...p,
                    image: (p.images && p.images[0]) ? p.images[0] : "https://via.placeholder.com/400"
                })));
            }
        } catch (err) {
            console.error("Failed to load related products", err);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: typeof product.id === 'string' ? parseInt(product.id) || Date.now() : product.id, // Handle ID type mismatch if any
            name: product.name,
            price: product.price,
            quantity: quantity,
            unit: product.unit || "unit", // Add required unit
            image: product.images && product.images[0] ? product.images[0] : "",
            seller: product.seller?.name || "Unknown Seller"
        });

        // Optional: Show toast or feedback
        // For now, redirect to cart or just stay? 
        // Let's open cart sidepanel if we had one, but we have a cart page.
        // Maybe just alert for MVP
        alert("Added to cart!");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Link href="/" className="text-primary hover:underline">Back to Marketplace</Link>
            </div>
        );
    }

    const sellerName = product.seller?.name || "Unknown Seller";
    const sellerLocation = product.location || "Nigeria"; // Use product location
    const isVerified = product.seller?.isKycVerified || product.verified;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
            <nav aria-label="Breadcrumb" className="flex text-sm text-secondary-text-light dark:text-secondary-text-dark mb-6">
                <ol className="flex items-center space-x-2">
                    <li><Link href="/" className="hover:text-primary">Home</Link></li>
                    <li><span className="text-gray-400">/</span></li>
                    <li><Link href="/" className="hover:text-primary">Marketplace</Link></li>
                    <li><span className="text-gray-400">/</span></li>
                    <li aria-current="page" className="font-medium text-text-light dark:text-text-dark truncate max-w-[200px]">{product.name}</li>
                </ol>
            </nav>

            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 md:hidden">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Market
            </Link>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                {/* Product Gallery */}
                <div className="product-gallery space-y-4">
                    <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark relative h-96">
                        <Image
                            src={product.images && product.images[selectedImage] ? product.images[selectedImage] : "https://via.placeholder.com/800"}
                            alt={product.name}
                            className="object-center object-cover hover:scale-105 transition-transform duration-500"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        {product.category && (
                            <div className="absolute top-4 left-4 z-10">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    {product.category}
                                </span>
                            </div>
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4 h-24">
                            {product.images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={cn(
                                        "relative rounded-lg overflow-hidden border aspect-w-1 aspect-h-1 h-full",
                                        selectedImage === idx ? "border-2 border-primary" : "border-border-light dark:border-border-dark hover:border-primary/50"
                                    )}
                                >
                                    <img src={img} alt="Detail" className="w-full h-full object-center object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="mt-10 lg:mt-0">
                    <div className="border-b border-border-light dark:border-border-dark pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">{product.name}</h1>
                                <div className="mt-2 flex items-center space-x-2 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                                    <MapPin className="h-4 w-4" />
                                    <span>{sellerLocation}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-primary font-medium">In Stock</span>
                                    {/* Logic for stock check could be added here */}
                                </div>
                            </div>
                            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors">
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4 flex items-center p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-sm w-fit">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                {sellerName.charAt(0)}
                            </div>
                            <div className="ml-3 pr-4">
                                <p className="text-sm font-medium text-text-light dark:text-text-dark">{sellerName}</p>
                                <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-secondary-text-light dark:text-secondary-text-dark ml-1">4.8 (120 reviews)</span>
                                    {isVerified && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            <CheckCircle className="h-3 w-3 mr-1" /> KYC Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="py-6">
                        <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mb-1">Price per {product.unit || "Unit"}</p>
                        <div className="flex items-baseline gap-4 mb-2">
                            <PriceTag amount={product.price} currency={(product.currency || "NGN") as "NGN" | "USD" | "USDT" | "USDC"} className="items-baseline text-3xl" />
                        </div>
                        <div className="mt-2 flex gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                Crypto Accepted
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                Gonana Wallet
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-sm prose-green dark:prose-invert text-secondary-text-light dark:text-secondary-text-dark mb-8">
                        <p>{product.description}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-text-light dark:text-text-dark">Quantity ({product.unit})</label>
                                <span className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Available: {product.quantity || "Many"}</span>
                            </div>
                            <div className="flex items-center border border-border-light dark:border-border-dark rounded-md w-40 bg-white dark:bg-gray-800">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md transition-colors">
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full text-center border-0 p-2 text-text-light dark:text-text-dark bg-transparent focus:ring-0 sm:text-sm font-semibold outline-none"
                                    min="1"
                                />
                                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md transition-colors">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Shipping Method</h3>
                            <div className="space-y-3">
                                <label className="relative flex items-center p-4 border border-primary bg-primary/5 dark:bg-primary/10 rounded-lg cursor-pointer transition-all">
                                    <input type="radio" name="shipping" className="h-4 w-4 text-primary border-gray-300 focus:ring-primary accent-primary" defaultChecked />
                                    <span className="ml-3 flex flex-1 flex-col">
                                        <span className="block text-sm font-medium text-text-light dark:text-text-dark">Gonana Logistics Partner</span>
                                        <span className="block text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1">Handled by TopShip Logistics • 3-5 Days</span>
                                    </span>
                                    <span className="ml-3 flex flex-col items-end">
                                        <span className="block text-sm font-medium text-text-light dark:text-text-dark">₦45,000</span>
                                        <span className="text-xs text-green-600 dark:text-green-400">Insured</span>
                                    </span>
                                </label>
                                <label className="relative flex items-center p-4 border border-border-light dark:border-border-dark hover:border-gray-400 dark:hover:border-gray-500 rounded-lg cursor-pointer transition-all bg-white dark:bg-gray-800">
                                    <input type="radio" name="shipping" className="h-4 w-4 text-primary border-gray-300 focus:ring-primary accent-primary" />
                                    <span className="ml-3 flex flex-1 flex-col">
                                        <span className="block text-sm font-medium text-text-light dark:text-text-dark">Self-Arranged Pickup</span>
                                        <span className="block text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1">You arrange your own transport</span>
                                    </span>
                                    <span className="ml-3 block text-sm font-medium text-text-light dark:text-text-dark">₦0.00</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <button onClick={handleAddToCart} className="flex-1 bg-primary border border-transparent rounded-lg py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Add to Cart
                            </button>
                            <button className="flex-1 bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-8 flex items-center justify-center text-base font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all">
                                Make an Offer
                            </button>
                        </div>
                        <p className="text-center text-xs text-secondary-text-light dark:text-secondary-text-dark mt-4 flex justify-center items-center gap-1">
                            <Lock className="h-3 w-3" /> Secure transaction via Gonana Escrow
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-20 border-t border-border-light dark:border-border-dark pt-10">
                <h2 className="text-2xl font-display font-bold text-text-light dark:text-text-dark mb-6">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((p) => (
                        <div key={p.id} className="group relative bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700 lg:aspect-none group-hover:opacity-75 lg:h-48 relative h-48">
                                <img src={p.image} alt={p.name} className="h-full w-full object-cover object-center lg:h-full lg:w-full" />
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-text-light dark:text-text-dark">
                                        <Link href={`/product/${p.id}`}>
                                            <span aria-hidden="true" className="absolute inset-0"></span>
                                            {p.name}
                                        </Link>
                                    </h3>
                                    <p className="text-sm font-bold text-primary">₦{p.price}</p>
                                </div>
                                <p className="mt-1 text-xs text-secondary-text-light dark:text-secondary-text-dark">{p.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
