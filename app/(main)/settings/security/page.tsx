"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Smartphone, Key, Lock, LogOut, CheckCircle } from "lucide-react";

export default function SecurityPage() {
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [show2faSetup, setShow2faSetup] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');
    const [setupCode, setSetupCode] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [auditLog] = useState([
        { id: 1, action: "Login", device: "Chrome / macOS", location: "Lagos, NG", time: "Just now", status: "success" },
        { id: 2, action: "Password Change", device: "Safari / iPhone", location: "Abuja, NG", time: "2 days ago", status: "success" },
        { id: 3, action: "Failed Login", device: "Firefox / Windows", location: "London, UK", time: "5 days ago", status: "failed" },
    ]);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Fetch initial status
    useEffect(() => {
        fetch('/api/auth/2fa/status')
            .then(res => res.json())
            .then(data => setIs2faEnabled(data.enabled))
            .catch(console.error);
    }, []);

    const handleToggle2fa = async () => {
        if (is2faEnabled) {
            if (confirm("Are you sure you want to disable 2FA? This will decrease your account security.")) {
                handleDisable2FA();
            }
        } else {
            setIsSettingUp(true);
            try {
                const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
                const data = await res.json();
                if (data.qrCode) {
                    setQrCodeData(data.qrCode);
                    setShow2faSetup(true);
                }
            } catch (error) {
                console.error("Setup failed", error);
                alert("Failed to initiate 2FA setup");
            } finally {
                setIsSettingUp(false);
            }
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert("New password must be at least 8 characters");
            return;
        }

        setIsChangingPassword(true);

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Password changed successfully!');
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                alert(data.error || 'Failed to change password');
            }
        } catch (error) {
            alert('Error changing password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDisable2FA = async () => {
        const code = prompt("Enter a code from your authenticator app to confirm disabling 2FA:");
        if (!code) return;

        try {
            const res = await fetch('/api/auth/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (res.ok) {
                alert('2FA has been disabled successfully');
                setIs2faEnabled(false);
            } else {
                alert(data.error || 'Failed to disable 2FA');
            }
        } catch (error) {
            alert('Error disabling 2FA');
        }
    };

    const confirm2faSetup = async () => {
        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                body: JSON.stringify({ code: setupCode })
            });
            const data = await res.json();

            if (data.success) {
                setIs2faEnabled(true);
                setShow2faSetup(false);
                setBackupCodes(data.backupCodes);
            } else {
                alert(data.error || "Verification failed. Please try again.");
            }
        } catch (error) {
            alert("Verification error.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">Security Settings</h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark">Manage your account security and authentication methods.</p>
            </div>

            {backupCodes.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400 mb-2">💾 Save Your Backup Codes!</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                        These codes are the ONLY way to access your account if you lose your authenticator device.
                        <strong>Save them in a secure place.</strong>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {backupCodes.map((code, i) => (
                            <div key={i} className="bg-white dark:bg-black/20 p-2 rounded text-center font-mono text-sm border border-yellow-100 dark:border-yellow-900/50 select-all">
                                {code}
                            </div>
                        ))}
                    </div>
                    <Button onClick={() => setBackupCodes([])} className="mt-4" variant="outline">
                        I have saved these codes
                    </Button>
                </div>
            )}

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
                                    disabled={isSettingUp}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm mb-4">
                                <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">Scan QR Code</p>
                                <p className="text-blue-600 dark:text-blue-400 mb-3">Open your authenticator app (Google Authenticator, Authy) and scan this code.</p>
                                <div className="bg-white p-2 w-36 h-36 mx-auto border rounded mb-3 flex items-center justify-center relative">
                                    {qrCodeData ? (
                                        <Image src={qrCodeData} alt="2FA QR Code" width={128} height={128} />
                                    ) : (
                                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </div>
                                <Input
                                    value={setupCode}
                                    onChange={(e) => setSetupCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="text-center tracking-widest font-mono text-lg"
                                    maxLength={6}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShow2faSetup(false)} className="flex-1">Cancel</Button>
                                <Button onClick={confirm2faSetup} className="flex-1" disabled={setupCode.length !== 6}>Verify & Enable</Button>
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

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input
                            type="password"
                            label="Current Password"
                            placeholder="••••••••"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                        />
                        <Input
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                        />
                        <Input
                            type="password"
                            label="Confirm New Password"
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? "Updating..." : "Update Password"}
                            </Button>
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
