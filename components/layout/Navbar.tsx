"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Moon, Sun, Menu, Bell, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const { isKycVerified, balances, formatPrice } = useWallet();
    const { user, signOut } = useAuth();

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Search */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/logo.png"
                                    alt="Gonana Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-display font-bold text-xl text-text-light dark:text-text-dark hidden sm:block">Gonana</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-text-light dark:text-text-dark hover:text-primary transition-colors">Marketplace</Link>
                            <Link href="/sell" className="text-sm font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-primary transition-colors">Sell</Link>
                            <Link href="/feed" className="text-sm font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-primary transition-colors">Community</Link>
                            <Link href="/logistics" className="text-sm font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-primary transition-colors">Logistics</Link>
                        </div>

                        <div className="hidden lg:block relative w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="block w-full pl-10 pr-3 py-1.5 border border-border-light dark:border-border-dark rounded-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-full hover:bg-background-light dark:hover:bg-border-dark transition-colors relative group">
                            <Bell className="h-5 w-5 text-secondary-text-light dark:text-secondary-text-dark" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
                        </button>

                        {isKycVerified ? (
                            <Link href="/wallet" className="hidden sm:flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-full px-3 py-1.5 gap-2 cursor-pointer hover:border-primary transition-colors">
                                <Wallet className="h-4 w-4 text-primary" />
                                <div className="flex flex-col text-xs leading-none">
                                    <span className="font-bold text-text-light dark:text-text-dark">{formatPrice(balances.NGN, "NGN")}</span>
                                    <span className="text-secondary-text-light dark:text-secondary-text-dark text-[10px]">
                                        {formatPrice(balances.USD + balances.USDT + balances.USDC, "USD")} (Total USD)
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login" className="hidden sm:flex text-sm font-medium text-primary border border-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                                Verify Identity (KYC)
                            </Link>
                        )}

                        <Link href="/cart" className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                        </Link>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 font-bold cursor-pointer hover:bg-red-500/30 transition-colors border border-red-500/30"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        ) : (
                            <Link href="/login" className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold cursor-pointer overflow-hidden border border-primary/30">
                                <User className="h-5 w-5" />
                            </Link>
                        )}

                        <button
                            className="md:hidden p-2 text-gray-500 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 pt-4 pb-6 space-y-4 shadow-xl">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Gonana..."
                            className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-text-light dark:text-text-light hover:text-primary hover:bg-primary/5 transition-colors">
                            Marketplace
                        </Link>
                        <Link href="/sell" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-text-light dark:text-text-light hover:text-primary hover:bg-primary/5 transition-colors">
                            Sell (List Product)
                        </Link>
                        <Link href="/feed" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-text-light dark:text-text-light hover:text-primary hover:bg-primary/5 transition-colors">
                            Community Feed
                        </Link>
                        <Link href="/logistics" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-text-light dark:text-text-light hover:text-primary hover:bg-primary/5 transition-colors">
                            Logistics
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
