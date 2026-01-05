"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    PlusCircle,
    Users,
    Truck,
    Wallet,
    Settings,
    Lock,
    X,
    LogOut,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { isKycVerified } = useWallet();
    const { user, signOut } = useAuth();

    // Define navigation items
    const navItems = [
        {
            name: "Marketplace",
            href: "/marketplace",
            icon: ShoppingBag,
            requiresKyc: false
        },
        {
            name: "Sell Product",
            href: "/sell",
            icon: PlusCircle,
            requiresKyc: false // Or true depending on business logic? Assuming false for now or handled in page
        },
        {
            name: "Community",
            href: "/feed",
            icon: Users,
            requiresKyc: false
        },
        {
            name: "Logistics",
            href: "/logistics",
            icon: Truck,
            requiresKyc: false
        },
        {
            name: "Wallet",
            href: "/wallet",
            icon: Wallet,
            requiresKyc: true // Locked if no KYC
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings,
            requiresKyc: false
        },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logo.png"
                                alt="Gonana"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-display font-bold text-xl text-text-light dark:text-text-dark">Gonana</span>
                    </Link>
                    <button onClick={onClose} className="md:hidden text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isLocked = item.requiresKyc && !isKycVerified;
                        const Icon = item.icon;

                        if (isLocked) {
                            return (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary-text-light dark:text-secondary-text-dark cursor-not-allowed opacity-70 group relative"
                                    title="Complete KYC to unlock"
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                    <Lock className="h-3.5 w-3.5 ml-auto text-gray-400" />

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        Verify Identity to unlock
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-light dark:hover:text-text-dark"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className={cn("font-medium text-sm", isActive && "font-semibold")}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="object-cover h-full w-full"
                                />
                            ) : (
                                <User className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                                {user?.displayName || "User"}
                            </p>
                            <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    );
}
