"use client";

import Link from "next/link";
import { Filter, ChevronRight, Grid, List, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import { useEffect, useState, useMemo } from "react";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/categories";
import { PriceTag } from "@/components/ui/PriceTag";

export default function MarketplacePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
    const [maxPrice, setMaxPrice] = useState<number>(1000000); // Default high max
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Category Filter
            if (selectedCategory !== "all" && product.category !== selectedCategory) {
                return false;
            }
            // Price Filter
            if (parseFloat(product.price) > maxPrice) {
                return false;
            }
            return true;
        });
    }, [products, selectedCategory, maxPrice]);

    const activeProductCount = filteredProducts.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <h1 id="marketplace-heading" className="sr-only">Marketplace page</h1>

            {/* Hero / Featured Section (Dynamic) */}
            <div className="mb-10">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-green-800 shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 px-8 py-12 md:px-16 md:py-20 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-2xl text-white">
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight drop-shadow-sm">
                                Fresh Food Commodities, <br />
                                <span className="text-green-200">Direct from Source.</span>
                            </h1>
                            <p className="text-green-50 mb-8 text-xl font-light">
                                Secure, transparent, and fair trade for Africa's agricultural future.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link href="/sell" className="bg-white text-primary hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Start Selling
                                </Link>
                            </div>
                        </div>
                        {/* Dynamic Stat or Image could go here */}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Categories */}
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <h3 className="text-lg font-display font-bold mb-4 text-text-light dark:text-text-dark flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            Categories
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center group",
                                        selectedCategory === "all"
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <span>All Categories</span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full transition-colors", selectedCategory === 'all' ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                                        {products.length}
                                    </span>
                                </button>
                            </li>
                            {PRODUCT_CATEGORIES.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center group",
                                            selectedCategory === cat.id
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <span>{cat.label}</span>
                                        {/* Ideally we count products per category here */}
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full transition-colors", selectedCategory === cat.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                                            {products.filter(p => p.category === cat.id).length}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Price Filter */}
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <h3 className="text-lg font-display font-bold mb-4 text-text-light dark:text-text-dark">Max Price</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-secondary-text-light dark:text-secondary-text-dark">
                                <span>Free</span>
                                <span className="font-medium text-primary"><PriceTag amount={maxPrice} currency="NGN" /></span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                            />
                            <p className="text-xs text-center text-gray-500">Move slider to filter by maximum price</p>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-white dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <p className="text-secondary-text-light dark:text-secondary-text-dark text-sm">
                            Showing <span className="font-bold text-text-light dark:text-text-dark">{activeProductCount}</span> results
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">View:</span>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn("p-2 rounded-md transition-all shadow-sm", viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-primary" : "text-gray-400 hover:text-gray-600")}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn("p-2 rounded-md transition-all shadow-sm", viewMode === 'list' ? "bg-white dark:bg-gray-700 text-primary" : "text-gray-400 hover:text-gray-600")}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-gray-500 text-sm">Loading marketplace...</p>
                        </div>
                    ) : activeProductCount > 0 ? (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === 'grid'
                                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                                : "grid-cols-1"
                        )}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-card-dark rounded-xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <Filter className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search criteria.</p>
                            <button
                                onClick={() => { setSelectedCategory("all"); setMaxPrice(1000000); }}
                                className="mt-6 text-primary hover:underline text-sm font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
