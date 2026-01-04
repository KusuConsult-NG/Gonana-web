"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
    id: string;
    label: string;
    badge?: number;
    icon?: ReactNode;
    content: ReactNode;
}

export interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    variant?: "line" | "pills";
}

export function Tabs({ tabs, defaultTab, onChange, variant = "line" }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div
                className={cn(
                    "flex",
                    variant === "line"
                        ? "border-b border-border-light dark:border-border-dark overflow-x-auto"
                        : "gap-2 flex-wrap"
                )}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    if (variant === "line") {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 -mb-px whitespace-nowrap text-sm font-medium transition-colors",
                                    "border-b-2 focus:outline-none",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-secondary-text-light dark:text-secondary-text-dark hover:text-text-light dark:hover:text-text-dark hover:border-gray-300"
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    }

                    // Pills variant
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-secondary-text-light dark:text-secondary-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span
                                    className={cn(
                                        "ml-1 py-0.5 px-2 rounded-full text-xs",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    )}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-6 animate-enter">{activeTabContent}</div>
        </div>
    );
}
