"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, Mail, Wallet, Settings as SettingsIcon, X, Check, Package, MessageCircle, TrendingUp, AlertCircle } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";

// Mock notifications data
const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        type: "order" as const,
        title: "Order #4829 has been shipped",
        message: 'Your shipment of 20kg Organic Avocados is on its way. Track your package now.',
        read: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        actionUrl: "/orders/4829",
        actionLabel: "Track Order",
        icon: Package,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
        id: "2",
        type: "wallet" as const,
        title: "Payment Received",
        message: "You received 0.45 ETH (~$1,200) from Buyer @EcoFarmLtd.",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: Wallet,
        color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
        id: "3",
        type: "message" as const,
        title: "Sarah from GreenGrocer sent a message",
        message: "Hi John, are the macadamia nuts still available for bulk purchase? I'm looking to buy about 50kg next week...",
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionUrl: "/messages/sarah",
        actionLabel: "Reply",
        icon: MessageCircle,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcy1v0aGmKJnDJHW1JQ4uGNh3zvMWjJOQsWBqafL7tDEc2vMbE3yVPPsZSYwAb49CvZ5OjX0qPEemYQooTrRPOXKcGkE0uNtGasGNNNylz4ce_NRjSLpkDI25C-C8W2AUK_QTT5Kn6hpghFNquu1yf0wec5QgmssBLKspTZI1xFVpSlob1BDpkPUtVWT677hMHX0OW7zCi98v-dm68xFjznOCYjPL1HtRnuoz_QK765CPYV92LJ2gsbHwNrYfUEgOw-dfFlja9mePk",
    },
    {
        id: "4",
        type: "feed" as const,
        title: "Your post is trending",
        message: "Your update on \"Sustainable Farming Practices\" has reached 500 likes. Keep it up!",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icon: TrendingUp,
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
    {
        id: "5",
        type: "system" as const,
        title: "KYC Verification Pending",
        message: "Please upload a clearer image of your ID document to complete your vendor verification.",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: "/kyc",
        actionLabel: "Complete KYC",
        icon: AlertCircle,
        color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<"all" | "order" | "message" | "wallet" | "system">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;
    const orderCount = notifications.filter((n) => n.type === "order" && !n.read).length;
    const messageCount = notifications.filter((n) => n.type === "message" && !n.read).length;

    const filteredNotifications =
        filter === "all"
            ? notifications
            : notifications.filter((n) => n.type === filter);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((n) => n.id !== id));
    };

    const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
        const now = new Date();
        const notifDate = new Date(notification.createdAt);
        const diffHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);

        let group = "Older";
        if (diffHours < 24) {
            group = "Today";
        } else if (diffHours < 48) {
            group = "Yesterday";
        }

        if (!acc[group]) acc[group] = [];
        acc[group].push(notification);
        return acc;
    }, {} as Record<string, typeof MOCK_NOTIFICATIONS>);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block lg:col-span-3 space-y-6">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-4">
                        <h2 className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider mb-4 px-2">
                            Dashboard
                        </h2>
                        <nav className="space-y-1">
                            {[
                                { label: "Overview", icon: "📊", href: "/" },
                                { label: "My Orders", icon: "🛍️", href: "/orders" },
                                { label: "Listings", icon: "📦", href: "/sell" },
                                { label: "Notifications", icon: "🔔", href: "/notifications", active: true, badge: unreadCount },
                                { label: "Messages", icon: "💬", href: "/messages" },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${item.active
                                            ? "bg-primary/10 text-primary"
                                            : "text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary"
                                        }`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    {item.label}
                                    {item.badge && item.badge > 0 ? (
                                        <Badge variant="primary" size="sm" className="ml-auto">
                                            {item.badge}
                                        </Badge>
                                    ) : null}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-4">
                        <h2 className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider mb-4 px-2">
                            Settings
                        </h2>
                        <nav className="space-y-1">
                            <Link
                                href="/settings"
                                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors"
                            >
                                <span className="mr-3 text-lg">👤</span>
                                Profile & KYC
                            </Link>
                            <Link
                                href="/settings/security"
                                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-muted-light dark:text-text-muted-dark hover:bg-background-light dark:hover:bg-background-dark hover:text-primary transition-colors"
                            >
                                <span className="mr-3 text-lg">🔒</span>
                                Security
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold font-display text-text-light dark:text-text-dark">
                                Notifications
                            </h1>
                            <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                                Stay updated on your orders, community interactions, and wallet activity.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <Link
                                href="/settings/notifications"
                                className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                <SettingsIcon className="h-4 w-4" />
                                Settings
                            </Link>
                        </div>
                    </div>

                    {/* Tabs Filter */}
                    <div className="border-b border-border-light dark:border-border-dark">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {[
                                { id: "all", label: "All", count: notifications.length },
                                { id: "order", label: "Orders", count: orderCount },
                                { id: "message", label: "Messages", count: messageCount },
                                { id: "wallet", label: "Wallet" },
                                { id: "system", label: "System" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as any)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${filter === tab.id
                                            ? "border-primary text-primary"
                                            : "border-transparent text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:border-gray-300"
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                            <div key={group}>
                                <div className="flex items-center mb-4">
                                    <h3 className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                                        {group}
                                    </h3>
                                    <div className="h-px bg-border-light dark:border-dark flex-grow ml-4"></div>
                                </div>

                                <div className="space-y-3">
                                    {groupNotifications.map((notification) => {
                                        const Icon = notification.icon;
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`group relative bg-surface-light dark:bg-surface-dark p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${!notification.read
                                                        ? "border-primary/30"
                                                        : "border-border-light dark:border-border-dark opacity-80 hover:opacity-100"
                                                    }`}
                                                onClick={() => !notification.read && markAsRead(notification.id)}
                                            >
                                                {!notification.read && (
                                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary"></div>
                                                )}

                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        {notification.avatar ? (
                                                            <Avatar src={notification.avatar} size="md" status="online" />
                                                        ) : (
                                                            <span
                                                                className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${notification.color}`}
                                                            >
                                                                <Icon className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-medium text-text-light dark:text-text-dark">
                                                                {notification.title}
                                                            </p>
                                                            <span className="text-xs text-text-muted-light dark:text-text-muted-dark whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>

                                                        {notification.actionUrl && notification.actionLabel && (
                                                            <div className="mt-3 flex gap-3">
                                                                <Link
                                                                    href={notification.actionUrl}
                                                                    className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                                                                >
                                                                    {notification.actionLabel}
                                                                </Link>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteNotification(notification.id);
                                                                    }}
                                                                    className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark hover:text-red-600 transition-colors"
                                                                >
                                                                    Dismiss
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="flex justify-center mt-8 pt-4">
                        <button className="text-sm text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1">
                            Load older notifications
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
