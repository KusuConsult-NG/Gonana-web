
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
    const pathname = usePathname();

    const navigation = [
        { name: "Edit Profile", href: "/settings", icon: User },
        { name: "Security & KYC", href: "/settings/security", icon: Shield },
        { name: "Notifications", href: "/settings/notifications", icon: Bell },
    ];

    return (
        <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <nav className="space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-light dark:hover:text-text-dark"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors",
                                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                                )}
                            />
                            <span className="truncate">{item.name}</span>
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                        </Link>
                    );
                })}
                <button className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 mt-6">
                    <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-red-600/70 group-hover:text-red-600" />
                    <span className="truncate">Sign out</span>
                </button>
            </nav>
        </aside>
    );
}
