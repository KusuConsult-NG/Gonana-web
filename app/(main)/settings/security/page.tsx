"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Smartphone, Key, Lock, LogOut, CheckCircle } from "lucide-react";

export default function SecurityPage() {
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [show2faSetup, setShow2faSetup] = useState(false);
    const [auditLog] = useState([
        { id: 1, action: "Login", device: "Chrome / macOS", location: "Lagos, NG", time: "Just now", status: "success" },
        { id: 2, action: "Password Change", device: "Safari / iPhone", location: "Abuja, NG", time: "2 days ago", status: "success" },
        { id: 3, action: "Failed Login", device: "Firefox / Windows", location: "London, UK", time: "5 days ago", status: "failed" },
    ]);

    const handleToggle2fa = () => {
        if (is2faEnabled) {
            if (confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) {
                setIs2faEnabled(false);
            }
        } else {
            setShow2faSetup(true);
        }
    };

    const confirm2faSetup = () => {
        // Simulate setup verification
        setIs2faEnabled(true);
        setShow2faSetup(false);
        alert("Two-Factor Authentication has been enabled successfully.");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">Security Settings</h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark">Manage your account security and authentication methods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2FA Section */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-text-light dark:text-text-dark">Two-Factor Authentication</h3>
                            <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                                Add an extra layer of security to your account by requiring a code when logging in.
                            </p>
                        </div>
                    </div>

                    {!show2faSetup ? (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border-light dark:border-border-dark">
                            <div className="flex items-center gap-3">
                                {is2faEnabled ? (
                                    <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                        <CheckCircle className="h-4 w-4" /> Enabled
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-secondary-text-light font-medium text-sm">
                                        <Lock className="h-4 w-4" /> Disabled
                                    </div>
                                )}
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={is2faEnabled}
                                    onChange={handleToggle2fa}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm mb-4">
                                <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">Scan QR Code</p>
                                <p className="text-blue-600 dark:text-blue-400 mb-3">Open your authenticator app (Google Authenticator, Authy) and scan this code.</p>
                                <div className="bg-white p-2 w-32 h-32 mx-auto border rounded mb-3 flex items-center justify-center text-xs text-gray-400">
                                    [QR Code Mock]
                                </div>
                                <Input
                                    placeholder="Enter 6-digit code"
                                    className="text-center tracking-widest font-mono text-lg"
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShow2faSetup(false)} className="flex-1">Cancel</Button>
                                <Button onClick={confirm2faSetup} className="flex-1">Verify & Enable</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <Key className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-light dark:text-text-dark">Change Password</h3>
                            <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                                Update your password regularly to keep your account safe.
                            </p>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <Input type="password" label="Current Password" placeholder="••••••••" />
                        <Input type="password" label="New Password" placeholder="••••••••" />
                        <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                        <div className="flex justify-end">
                            <Button variant="outline">Update Password</Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Login Activity */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-gray-500" /> Recent Login Activity
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-secondary-text-light dark:text-secondary-text-dark uppercase">
                            <tr>
                                <th className="px-4 py-3">Device / Browser</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {auditLog.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 font-medium text-text-light dark:text-text-dark">
                                        {log.device}
                                        <div className="text-xs text-secondary-text-light dark:text-secondary-text-dark font-normal">{log.action}</div>
                                    </td>
                                    <td className="px-4 py-3 text-secondary-text-light dark:text-secondary-text-dark">{log.location}</td>
                                    <td className="px-4 py-3 text-secondary-text-light dark:text-secondary-text-dark">{log.time}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'success'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {log.status === 'success' ? 'Successful' : 'Failed'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium flex items-center gap-1">
                                            <LogOut className="h-3 w-3" /> Log out
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
