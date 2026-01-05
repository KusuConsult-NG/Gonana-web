"use client";

import Link from "next/link";
import { ArrowRight, Users, Shield, TrendingUp, Leaf, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden font-sans selection:bg-primary/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply dark:bg-primary/10"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-400/20 blur-[120px] mix-blend-multiply dark:bg-green-400/10"></div>
            </div>

            <div className="relative z-10">
                {/* Landing Page Header */}
                <header className="absolute top-0 w-full z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Gonana" width={32} height={32} className="w-8 h-8" />
                            <span className="font-bold text-xl text-gray-900 dark:text-white">Gonana</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup" className="hidden sm:flex text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="relative pt-32 pb-32 lg:pt-48 lg:pb-48">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Trusted by 450,000+ farmers</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-8 leading-[1.1] drop-shadow-sm">
                            Fresh Harvests,<br />
                            <span className="text-primary">Direct from Farm</span>
                        </h1>

                        <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                            Connect directly with verified farmers.
                            <span className="font-semibold text-gray-900 dark:text-white"> No middlemen. Fair prices.</span> <br />
                            Experience the future of agricultural trade in Africa.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/signup"
                                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/marketplace"
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold text-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                Browse Market
                            </Link>
                        </div>

                        {/* Hero Image / UI Mockup placeholder with glass effect */}
                        <div className="mt-20 relative mx-auto max-w-5xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-transparent z-10 bottom-0 h-40"></div>
                            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-4 shadow-2xl skew-y-1 transform transition-transform hover:skew-y-0 duration-700">
                                <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-video md:aspect-[21/9] relative grid place-items-center group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
                                    <div className="text-center z-10 p-8">
                                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                            <Leaf className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Preview</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Trading volume over ₦50M+ this month</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section with Glass Cards */}
                <div className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-y border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Users, label: "Verified Farmers", value: "450k+", color: "text-blue-500", bg: "bg-blue-500/10" },
                                { icon: Shield, label: "Secure Transactions", value: "100%", color: "text-green-500", bg: "bg-green-500/10" },
                                { icon: TrendingUp, label: "Monthly Volume", value: "₦50M+", color: "text-purple-500", bg: "bg-purple-500/10" },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                                    <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mr-6`}>
                                        <stat.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                        <div className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Split */}
                <div className="py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-20 items-center">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-green-300 rounded-full opacity-20 blur-3xl"></div>
                                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-default">
                                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">Verified Quality</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Every farmer is vetted personally.</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                    Why Choose Gonana?
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    We're building the infrastructure for trust in African agriculture.
                                    Our platform ensures transparent pricing, secure payments, and reliable logistics.
                                </p>
                                <ul className="space-y-4 mb-10">
                                    {[
                                        "Escrow-protected payments",
                                        "End-to-end logistics tracking",
                                        "Instant payments in Fiat or Crypto",
                                        "Direct community access"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className="text-primary font-bold text-lg hover:underline underline-offset-4 decoration-2 inline-flex items-center gap-2"
                                >
                                    Learn more about our mission <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="py-20 px-4">
                    <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                        {/* Background blobs for CTA */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                                Ready to join the revolution?
                            </h2>
                            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
                                Start trading with thousands of verified farmers and buyers today.
                                No fees on your first 3 transactions.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-3 bg-white text-black hover:bg-gray-200 font-bold py-5 px-10 rounded-2xl shadow-lg transition-all transform hover:scale-105 text-lg"
                            >
                                Create Free Account
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
