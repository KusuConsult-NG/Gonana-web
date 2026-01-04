"use client";

import { SettingsSidebar } from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark mb-8">Account Settings</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                <SettingsSidebar />

                <main className="lg:col-span-9">
                    <div className="bg-surface-light dark:bg-surface-dark shadow-sm rounded-xl border border-border-light dark:border-border-dark overflow-hidden min-h-[500px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
