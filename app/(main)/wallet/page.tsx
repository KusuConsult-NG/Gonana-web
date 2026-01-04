"use client";

import { useWallet } from "@/context/WalletContext";
import { useState, useRef } from "react";
import {
    CreditCard, Wallet, ArrowRight, ShieldCheck, AlertTriangle,
    Download, TrendingUp, ArrowUpRight, ArrowDownLeft,
    History, PieChart, Coins, Banknote, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Tab = "overview" | "deposit" | "withdraw" | "earn" | "transactions";
type Currency = "NGN" | "USD" | "USDT" | "USDC";

export default function WalletPage() {
    const { balances, isKycVerified, formatPrice } = useWallet();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>("NGN");
    const [amount, setAmount] = useState("");
    const reportRef = useRef<HTMLDivElement>(null);

    // Mock Transactions
    const transactions = [
        { id: "TX1001", type: "deposit", amount: 50000, currency: "NGN", date: "2024-05-20", status: "completed", desc: "Bank Deposit" },
        { id: "TX1002", type: "purchase", amount: 12500, currency: "NGN", date: "2024-05-18", status: "completed", desc: "Purchase: Organic Maize" },
        { id: "TX1003", type: "yield", amount: 2.50, currency: "USDT", date: "2024-05-15", status: "completed", desc: "Staking Reward" },
        { id: "TX1004", type: "withdrawal", amount: 5000, currency: "NGN", date: "2024-05-10", status: "completed", desc: "Withdrawal to Bank" },
        { id: "TX1005", type: "deposit", amount: 100, currency: "USDC", date: "2024-05-01", status: "completed", desc: "Crypto Deposit" },
    ];

    const generatePDF = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("Gonana_Transaction_History.pdf");
        } catch (err) {
            console.error("PDF Generation failed", err);
            alert("Failed to generate PDF");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">Wallet</h1>
                    <p className="text-secondary-text-light dark:text-secondary-text-dark">Manage your assets, savings, and transactions.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "deposit" ? "primary" : "outline"}
                        onClick={() => setActiveTab("deposit")}
                        size="sm"
                    >
                        <ArrowDownLeft className="h-4 w-4 mr-2" /> Deposit
                    </Button>
                    <Button
                        variant={activeTab === "withdraw" ? "primary" : "outline"}
                        onClick={() => setActiveTab("withdraw")}
                        size="sm"
                    >
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Withdraw
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-border-light dark:border-border-dark scrollbar-hide">
                {[
                    { id: "overview", label: "Overview", icon: PieChart },
                    { id: "earn", label: "Savings & Staking", icon: TrendingUp },
                    { id: "transactions", label: "History", icon: History },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                            activeTab === tab.id
                                ? "bg-primary text-white shadow-sm"
                                : "text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Total Balance Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-gradient-to-br from-primary to-green-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-green-100 font-medium mb-1">Total Portfolio Value</p>
                                    <h2 className="text-4xl font-bold mb-6">₦{formatPrice(balances.NGN + (balances.USD * 1500) + (balances.USDT * 1500), "NGN").replace("₦", "")}</h2>

                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-green-100 text-xs uppercase tracking-wider mb-1">Fiat (NGN)</p>
                                            <p className="text-xl font-semibold">{formatPrice(balances.NGN, "NGN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-100 text-xs uppercase tracking-wider mb-1">Stablecoins (USD)</p>
                                            <p className="text-xl font-semibold">${(balances.USD + balances.USDT + balances.USDC).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                                    <Wallet className="h-64 w-64 text-white" />
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className={cn(
                                "rounded-2xl p-6 border flex flex-col justify-between",
                                isKycVerified
                                    ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                    : "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                            )}>
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        {isKycVerified ? <ShieldCheck className="h-6 w-6 text-green-600" /> : <AlertTriangle className="h-6 w-6 text-yellow-600" />}
                                        <h3 className="font-bold text-lg">Account Status</h3>
                                    </div>
                                    <p className="text-sm opacity-80 mb-4">
                                        {isKycVerified
                                            ? "Your account is fully verified. You have access to all wallet features and unlimited withdrawals."
                                            : "Your account is not verified. Limits apply to deposits and withdrawals."
                                        }
                                    </p>
                                </div>
                                {!isKycVerified && (
                                    <Link href="/kyc" className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-center font-bold text-sm transition-colors">
                                        Complete KYC
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Assets List */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark font-bold text-text-light dark:text-text-dark">
                                Your Assets
                            </div>
                            <div className="divide-y divide-border-light dark:divide-border-dark">
                                {[
                                    { symbol: "NGN", name: "Nigerian Naira", balance: balances.NGN, icon: <Banknote className="h-5 w-5 text-green-600" />, type: "Fiat" },
                                    { symbol: "USDT", name: "Tether USD", balance: balances.USDT, icon: <Coins className="h-5 w-5 text-green-500" />, type: "Stablecoin" },
                                    { symbol: "USDC", name: "USD Coin", balance: balances.USDC, icon: <Coins className="h-5 w-5 text-blue-500" />, type: "Stablecoin" },
                                ].map((asset) => (
                                    <div key={asset.symbol} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                {asset.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-light dark:text-text-dark">{asset.name}</p>
                                                <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark">{asset.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-text-light dark:text-text-dark">
                                                {asset.symbol === "NGN" ? formatPrice(asset.balance, "NGN") : `${asset.balance.toFixed(2)} ${asset.symbol}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "earn" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Savings Plan */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-2">Gonana Flex Savings</h3>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mb-6">
                                    Earn up to 12% APY on your NGN deposits. Withdraw anytime without penalty.
                                </p>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark">APY Rate</span>
                                        <span className="font-bold text-green-600">12%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark">Min Deposit</span>
                                        <span className="font-medium text-text-light dark:text-text-dark">₦5,000</span>
                                    </div>
                                </div>
                                <Button className="w-full">Start Saving</Button>
                            </div>

                            {/* Staking */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600">
                                    <RefreshCw className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-2">Stablecoin Staking</h3>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mb-6">
                                    Lock your USDT/USDC for 30-90 days and earn high yields up to 15% APY.
                                </p>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark">APY Rate</span>
                                        <span className="font-bold text-green-600">8% - 15%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark">Lock Period</span>
                                        <span className="font-medium text-text-light dark:text-text-dark">30 - 90 Days</span>
                                    </div>
                                </div>
                                <Button className="w-full">Stake Assets</Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "transactions" && (
                    <div className="space-y-6">
                        <div className="flex justify-end mb-4">
                            <Button variant="outline" size="sm" onClick={generatePDF}>
                                <Download className="h-4 w-4 mr-2" /> Download Statement (PDF)
                            </Button>
                        </div>

                        <div ref={reportRef} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden p-6">
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-6">Transaction History</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-secondary-text-light dark:text-secondary-text-dark uppercase bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Description</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="bg-white dark:bg-surface-dark border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4 font-medium text-text-light dark:text-text-dark">{tx.date}</td>
                                                <td className="px-6 py-4 text-text-light dark:text-text-dark">{tx.desc} <span className="block text-xs text-gray-500">Ref: {tx.id}</span></td>
                                                <td className="px-6 py-4 capitalize">{tx.type}</td>
                                                <td className={cn("px-6 py-4 font-bold", tx.type === "deposit" || tx.type === "yield" ? "text-green-600" : "text-text-light dark:text-text-dark")}>
                                                    {tx.type === "deposit" || tx.type === "yield" ? "+" : "-"}
                                                    {tx.amount.toLocaleString()} {tx.currency}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">
                                Generated by Gonana Marketplace on {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === "deposit" || activeTab === "withdraw") && (
                    <div className="max-w-xl mx-auto bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-8 text-center">
                        <div className="h-16 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            {activeTab === "deposit" ? <ArrowDownLeft className="h-8 w-8 text-green-600" /> : <ArrowUpRight className="h-8 w-8 text-red-600" />}
                        </div>
                        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">
                            {activeTab === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
                        </h2>
                        <p className="text-secondary-text-light dark:text-secondary-text-dark mb-8">
                            This feature is coming soon in the production release.
                        </p>
                        <Button variant="outline" onClick={() => setActiveTab("overview")}>
                            Back to Wallet
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
