"use client";

import Link from "next/link";
import { Filter, ChevronRight, Grid, List, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (res.ok) {
                    const data = await res.json();
                    // Parse images for each product
                    const parsedData = data.map((p: any) => ({
                        ...p,
                        image: p.images ? JSON.parse(p.images) : [],
                    }));
                    setProducts(parsedData);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <h1 id="marketplace-heading" className="sr-only">Makeplace page</h1>
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-r from-primary to-primary-dark shadow-lg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-white max-w-xl">
                        <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">Fresh Harvests, <br />Direct from Farmers.</h1>
                        <p className="text-primary-light mb-8 text-lg font-light">Join the decentralized marketplace connecting sustainable growers with global buyers. Secure, fast, and transparent.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/sell" className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-full shadow-md transition-transform transform hover:scale-105 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                List Your Produce
                            </Link>
                            <button className="bg-primary-dark/40 backdrop-blur-sm border border-white/30 text-white hover:bg-primary-dark/60 font-medium py-3 px-6 rounded-full transition-colors">
                                How it works
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="text-lg font-display font-bold mb-4 text-text-light dark:text-text-dark flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            Categories
                        </h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { name: "Fresh Produce", count: 128 },
                                { name: "Seeds & Saplings", count: 45 },
                                { name: "Fertilizers", count: 32 },
                                { name: "Farming Tools", count: 89 },
                                { name: "Livestock", count: 12 },
                            ].map((cat) => (
                                <li key={cat.name}>
                                    <a href="#" className="flex items-center justify-between px-3 py-2 text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-100 dark:hover:bg-card-dark rounded-lg transition-colors group">
                                        <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-card-dark rounded-full text-secondary-text-light dark:text-secondary-text-dark group-hover:bg-primary/10 group-hover:text-primary transition-colors">{cat.count}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-display font-bold mb-4 text-text-light dark:text-text-dark">Price Range</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-secondary-text-light dark:text-secondary-text-dark">
                                <span>$0</span>
                                <span>$1000+</span>
                            </div>
                            <input type="range" min="0" max="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700" />
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <p className="text-secondary-text-light dark:text-secondary-text-dark text-sm">Showing <span className="font-semibold text-text-light dark:text-text-dark">{products.length}</span> products</p>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-1">
                                <button className="p-1.5 rounded bg-primary text-white shadow-sm">
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button className="p-1.5 rounded text-gray-400 hover:text-primary transition-colors">
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500">No products found. Be the first to list something!</p>
                            <Link href="/sell" className="mt-4 inline-block text-primary font-medium hover:underline">List a Product</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
