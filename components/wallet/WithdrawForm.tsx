"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, ArrowRight, CheckCircle, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Network = "ethereum" | "polygon" | "bsc";

export default function WithdrawForm({ onSuccess }: { onSuccess?: () => void }) {
    const { balances, formattedRates, isKycVerified, formatPrice, deduct } = useWallet();
    const [currency, setCurrency] = useState<"ETH" | "BNB" | "MATIC" | "USDT" | "USDC">("ETH");
    const [network, setNetwork] = useState<Network>("ethereum");
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successTx, setSuccessTx] = useState("");

    // Update network defaults when currency changes
    useEffect(() => {
        if (currency === "ETH") setNetwork("ethereum");
        if (currency === "BNB") setNetwork("bsc");
        if (currency === "MATIC") setNetwork("polygon");
        if ((currency === "USDT" || currency === "USDC") && network === "bsc") setNetwork("ethereum"); // Default to ETH for stablecoins
    }, [currency]);

    const getMaxAmount = () => {
        return balances[currency] || 0;
    };

    const handleMax = () => {
        setAmount(getMaxAmount().toString());
    };

    const getUsdValue = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return 0;

        switch (currency) {
            case "ETH": return val * formattedRates.ETH_USD;
            case "BNB": return val * formattedRates.BNB_USD;
            case "MATIC": return val * formattedRates.MATIC_USD;
            case "USDT": return val * formattedRates.USDT_USD;
            case "USDC": return val * formattedRates.USDC_USD;
            default: return 0;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessTx("");
        setIsLoading(true);

        try {
            if (!isKycVerified) {
                throw new Error("KYC verification is required for withdrawals.");
            }

            if (parseFloat(amount) <= 0) {
                throw new Error("Invalid amount.");
            }

            if (parseFloat(amount) > getMaxAmount()) {
                throw new Error("Insufficient funds.");
            }

            const res = await fetch("/api/crypto/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toAddress: address,
                    amount: parseFloat(amount),
                    currency,
                    network,
                    twoFactorCode
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Withdrawal failed");
            }

            // Success
            deduct(parseFloat(amount), currency); // Update UI
            setSuccessTx(data.txHash);
            setAmount("");
            setAddress("");
            setTwoFactorCode("");
            if (onSuccess) onSuccess();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (successTx) {
        return (
            <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Withdrawal Submitted!</h3>
                <p className="text-gray-500 mb-6">Your transaction is being processed.</p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono break-all mb-6 text-gray-600">
                    {successTx}
                </div>
                <Button onClick={() => setSuccessTx("")}>Make Another Withdrawal</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-lg mx-auto">
            {!isKycVerified && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">You must complete Identity Verification (KYC) before withdrawing funds.</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Asset</label>
                    <select
                        value={currency}
                        onChange={(e: any) => setCurrency(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="BNB">BNB</option>
                        <option value="MATIC">Polygon (MATIC)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="USDC">USD Coin (USDC)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Network</label>
                    <select
                        value={network}
                        onChange={(e: any) => setNetwork(e.target.value)}
                        disabled={['ETH', 'BNB', 'MATIC'].includes(currency)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="ethereum">Ethereum (ERC20)</option>
                        <option value="polygon">Polygon</option>
                        <option value="bsc">BNB Chain (BEP20)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <Input
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                    <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={handleMax}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary/80"
                    >
                        MAX
                    </button>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Available: {formatPrice(getMaxAmount(), currency)}</span>
                    <span>≈ ${getUsdValue().toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">2FA Code</label>
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Secure
                    </span>
                </div>
                <Input
                    placeholder="Enter 6-digit code from authenticator"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    maxLength={6}
                    required
                />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg text-xs text-blue-600 dark:text-blue-400 flex gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <p>Withdrawals are processed automatically. Large amounts may require manual review (up to 24h).</p>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isKycVerified || parseFloat(amount) <= 0}
            >
                {isLoading ? "Processing..." : "Withdraw Funds"}
                {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
        </form>
    );
}
