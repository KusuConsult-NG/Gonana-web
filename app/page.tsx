"use client";

import Link from "next/link";
import { ArrowRight, Users, Shield, TrendingUp, Leaf } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    {/* Gonana Logo */}
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/logo.png"
                            alt="Gonana Logo"
                            width={96}
                            height={96}
                            className="drop-shadow-2xl"
                        />
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        Fresh Harvests,<br />
                        <span className="text-primary">Direct from Farmers</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto font-medium">
                        Join a Community
                    </p>

                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        <span className="font-bold text-primary text-2xl">Connect with 45,000+ verified farmers</span>
                        <br />
                        Join thousands of farmers and buyers trading today
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">45,000+</div>
                        <div className="text-gray-600 dark:text-gray-300">Verified Farmers</div>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
                        <div className="text-gray-600 dark:text-gray-300">Secure Transactions</div>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">₦50M+</div>
                        <div className="text-gray-600 dark:text-gray-300">Monthly Trade Volume</div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white dark:bg-gray-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
                        Why Choose Gonana?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Leaf className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Fresh Produce</h3>
                            <p className="text-gray-600 dark:text-gray-400">Direct from farm to your doorstep. No middlemen, just fresh quality produce at fair prices.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Secure Payments</h3>
                            <p className="text-gray-600 dark:text-gray-400">Multiple payment options including crypto and fiat. Your transactions are safe and encrypted.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Verified Community</h3>
                            <p className="text-gray-600 dark:text-gray-400">Join 45,000+ verified farmers and buyers in Africa's largest agricultural marketplace.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-primary py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Join the Revolution?
                    </h2>
                    <p className="text-xl text-primary-light mb-8">
                        Start trading with verified farmers and buyers today
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-3 bg-white text-primary hover:bg-gray-100 font-bold py-4 px-10 rounded-xl shadow-lg transition-all transform hover:scale-105 text-lg"
                    >
                        Create Free Account
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
