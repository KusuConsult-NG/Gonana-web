"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Moon, Sun, Menu, Bell, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
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
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left: Mobile Menu & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            onClick={onMenuClick}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products, farmers..."
                                className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search icon for mobile */}
                        <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <Search className="h-5 w-5" />
                        </button>

                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group text-gray-500 dark:text-gray-400">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                        </button>

                        {isKycVerified ? (
                            <Link href="/wallet" className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 gap-2 hover:border-primary transition-colors">
                                <Wallet className="h-4 w-4 text-primary" />
                                <div className="flex flex-col text-xs leading-none">
                                    <span className="font-bold text-gray-900 dark:text-white">{formatPrice(balances.NGN, "NGN")}</span>
                                    {/* <span className="text-gray-500 text-[10px]">Total Bal</span> */}
                                </div>
                            </Link>
                        ) : (
                            <Link href={user ? "/kyc" : "/login"} className="hidden md:flex text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors">
                                Verify Identity
                            </Link>
                        )}

                        <Link href="/cart" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
                        </Link>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        <div className="flex items-center gap-2">
                            {user ? (
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user.name?.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[100px]">{user.email}</p>
                                </div>
                            ) : null}
                            <Link href={user ? "/settings" : "/login"} className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                {user?.image ? (
                                    <Image src={user.image} alt="Profile" width={32} height={32} className="object-cover h-full w-full" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
