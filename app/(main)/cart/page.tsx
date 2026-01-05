"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Trash2, Heart, Minus, Plus, Truck, CheckCircle, ArrowRight, CreditCard, Wallet, CircleDollarSign } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PriceTag } from "@/components/ui/PriceTag";

export default function CartPage() {
    const { items: cartItems, updateQuantity, removeItem, clearCart, subtotal } = useCart();

    const shipping = 3500;
    const tax = subtotal * 0.05; // 5% tax mock
    const total = subtotal + shipping + tax;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">Shopping Cart</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Link href="/">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/">Marketplace</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-primary font-medium">Cart</span>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-8">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden mb-6">
                        <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">Selected Items ({cartItems.length})</h2>
                            <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors">
                                <Trash2 className="h-4 w-4" /> Clear Cart
                            </button>
                        </div>

                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {cartItems.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-white">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={128}
                                                height={128}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-text-light dark:text-text-dark"><Link href="#">{item.name}</Link></h3>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sold by: <span className="text-primary font-medium">{item.seller}</span></p>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.unit}</p>
                                                </div>
                                                <div className="flex sm:justify-end items-start">
                                                    <p className="text-lg font-bold text-text-light dark:text-text-dark">
                                                        <PriceTag amount={item.price} currency="NGN" />
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-lg transition-colors text-gray-600 dark:text-gray-300">
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <input className="w-12 border-0 bg-transparent text-center text-sm focus:ring-0 p-0 text-text-light dark:text-text-dark font-medium" readOnly value={item.quantity} type="number" />
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-lg transition-colors text-gray-600 dark:text-gray-300">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <button className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1">
                                                    <Heart className="h-4 w-4" /> Save for later
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 mb-6">
                        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            Shipping Options
                        </h2>
                        <div className="space-y-4">
                            <label className="relative flex cursor-pointer rounded-lg border border-primary bg-primary/5 dark:bg-primary/10 p-4 shadow-sm focus:outline-none">
                                <input type="radio" name="delivery-method" value="logistics" className="sr-only" defaultChecked />
                                <span className="flex flex-1">
                                    <span className="flex flex-col">
                                        <span className="block text-sm font-medium text-text-light dark:text-text-dark">Standard Logistics Partner (GIG Logistics)</span>
                                        <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">Trusted 3rd party logistics with tracking.</span>
                                        <span className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">Estimated delivery: 2-3 Business Days</span>
                                    </span>
                                </span>
                                <span className="text-primary ml-4 self-center">
                                    <CheckCircle className="h-5 w-5" />
                                </span>
                                <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-primary" aria-hidden="true"></span>
                            </label>

                            <label className="relative flex cursor-pointer rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-sm focus:outline-none hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                                <input type="radio" name="delivery-method" value="seller" className="sr-only" />
                                <span className="flex flex-1">
                                    <span className="flex flex-col">
                                        <span className="block text-sm font-medium text-text-light dark:text-text-dark">Direct from Seller</span>
                                        <span className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">Arranged directly with the farmer. Best for bulk.</span>
                                        <span className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">Estimated delivery: Varies</span>
                                    </span>
                                </span>
                                <span className="text-gray-300 dark:text-gray-600 ml-4 self-center h-5 w-5 border rounded-full"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 mt-8 lg:mt-0">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Order Summary</h2>
                        <div className="flow-root">
                            <dl className="-my-4 text-sm divide-y divide-border-light dark:divide-border-dark">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                                    <dd className="font-medium text-text-light dark:text-text-dark"><PriceTag amount={subtotal} currency="NGN" /></dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600 dark:text-gray-400">Shipping Estimate</dt>
                                    <dd className="font-medium text-text-light dark:text-text-dark"><PriceTag amount={shipping} currency="NGN" /></dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600 dark:text-gray-400">Tax</dt>
                                    <dd className="font-medium text-text-light dark:text-text-dark"><PriceTag amount={tax} currency="NGN" /></dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-base font-bold text-text-light dark:text-text-dark">Order Total</dt>
                                    <dd className="text-base font-bold text-primary">
                                        <PriceTag amount={total} currency="NGN" className="text-lg" />
                                    </dd>
                                </div>
                                <div className="py-2 flex items-center justify-end">
                                    {/* Dual pricing handled by PriceTag */}
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-2">Accepted Payments</h3>
                            <div className="flex gap-2 text-gray-400 dark:text-gray-500">
                                <CreditCard className="h-6 w-6" />
                                <Wallet className="h-6 w-6" />
                                <CircleDollarSign className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link href="/checkout" className="w-full bg-primary border border-transparent rounded-lg shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex justify-center items-center gap-2">
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/" className="text-sm text-primary hover:text-primary-dark font-medium">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
