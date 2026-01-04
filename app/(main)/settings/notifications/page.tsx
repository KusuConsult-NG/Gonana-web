"use client";

import { useState } from "react";
import { Mail, Smartphone } from "lucide-react";

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState({
        orderUpdates: true,
        promotions: false,
        securityAlerts: true,
        communityMentions: true,
        newsletter: false,
    });

    const toggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
    );

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Notification Preferences</h2>
                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                    Choose how and when you want to be communicated with.
                </p>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-base font-semibold text-text-light dark:text-text-dark flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5 text-gray-400" /> Email Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark border-dashed">
                            <div>
                                <p className="font-medium text-text-light dark:text-text-dark">Order Updates</p>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Get notified about your order status and delivery.</p>
                            </div>
                            <ToggleSwitch checked={preferences.orderUpdates} onChange={() => toggle('orderUpdates')} />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark border-dashed">
                            <div>
                                <p className="font-medium text-text-light dark:text-text-dark">Security Alerts</p>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Important alerts about your account security.</p>
                            </div>
                            <ToggleSwitch checked={preferences.securityAlerts} onChange={() => toggle('securityAlerts')} />
                        </div>
                        <div className="flex items-center justify-between py-3 border-dashed">
                            <div>
                                <p className="font-medium text-text-light dark:text-text-dark">Weekly Newsletter</p>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Top stories, tips, and market trends.</p>
                            </div>
                            <ToggleSwitch checked={preferences.newsletter} onChange={() => toggle('newsletter')} />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-semibold text-text-light dark:text-text-dark flex items-center gap-2 mb-4">
                        <Smartphone className="h-5 w-5 text-gray-400" /> Push Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark border-dashed">
                            <div>
                                <p className="font-medium text-text-light dark:text-text-dark">Community Mentions</p>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">When someone mentions you or replies to your post.</p>
                            </div>
                            <ToggleSwitch checked={preferences.communityMentions} onChange={() => toggle('communityMentions')} />
                        </div>
                        <div className="flex items-center justify-between py-3 border-dashed">
                            <div>
                                <p className="font-medium text-text-light dark:text-text-dark">Promotions & Deals</p>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Occasional alerts about sales and special offers.</p>
                            </div>
                            <ToggleSwitch checked={preferences.promotions} onChange={() => toggle('promotions')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
