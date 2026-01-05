"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import { initializePaystackPayment, convertToKobo } from "@/lib/paystack";
import { ArrowDownLeft, Wallet, CreditCard } from "lucide-react";

interface DepositFormProps {
    onSuccess?: () => void;
}

export default function DepositForm({ onSuccess }: DepositFormProps) {
    const { data: session } = useSession();
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<"NGN">("NGN");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.email) {
            alert("Please login to deposit funds");
            return;
        }

        const depositAmount = parseFloat(amount);
        if (!depositAmount || depositAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        // Minimum deposit check
        if (depositAmount < 100) {
            alert("Minimum deposit is ₦100");
            return;
        }

        setIsProcessing(true);

        try {
            // Initialize Paystack payment for wallet top-up
            initializePaystackPayment(
                {
                    email: session.user.email,
                    amount: convertToKobo(depositAmount),
                    currency: "NGN",
                    metadata: {
                        type: "wallet_topup",
                        userId: session.user.id,
                        currency: currency,
                        depositAmount: depositAmount,
                    },
                },
                async (response) => {
                    // Payment successful
                    alert(`Deposit successful! Your wallet will be updated shortly. Reference: ${response.reference}`);

                    // Reset form
                    setAmount("");
                    setIsProcessing(false);

                    // Call success callback
                    if (onSuccess) {
                        onSuccess();
                    }

                    // Reload page to show updated balance
                    window.location.reload();
                },
                () => {
                    // User closed popup
                    setIsProcessing(false);
                }
            );
        } catch (error) {
            console.error("Deposit error:", error);
            alert("Failed to initiate deposit. Please try again.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleDeposit} className="space-y-6">
            {/* Currency Selection */}
            <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Currency
                </label>
                <div className="grid grid-cols-1 gap-3">
                    <label className="relative flex cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4 shadow-sm">
                        <input
                            type="radio"
                            name="currency"
                            value="NGN"
                            className="sr-only"
                            checked={currency === "NGN"}
                            onChange={(e) => setCurrency(e.target.value as "NGN")}
                        />
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                                    ₦
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-text-light dark:text-text-dark">
                                        Nigerian Naira (NGN)
                                    </span>
                                    <span className="block text-xs text-gray-500">
                                        Deposit via Card/Bank Transfer
                                    </span>
                                </div>
                            </div>
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                    </label>
                </div>
            </div>

            {/* Amount Input */}
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Amount (NGN)
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">₦</span>
                    </div>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="100"
                        step="0.01"
                        required
                        className="block w-full pl-8 pr-12 py-3 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary text-lg font-medium"
                    />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Minimum deposit: ₦100
                </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Quick Select
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[1000, 5000, 10000, 50000].map((quickAmount) => (
                        <button
                            key={quickAmount}
                            type="button"
                            onClick={() => setAmount(quickAmount.toString())}
                            className="px-3 py-2 text-sm font-medium border border-border-light dark:border-border-dark rounded-lg hover:bg-primary/5 hover:border-primary transition-colors"
                        >
                            ₦{(quickAmount / 1000).toFixed(0)}k
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Secure Payment via Paystack
                        </h4>
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            You'll be redirected to Paystack to complete your payment securely.
                            Supports cards, bank transfer, USSD, and mobile money.
                        </p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isProcessing || !amount || parseFloat(amount) < 100}
                isLoading={isProcessing}
            >
                {isProcessing ? (
                    "Processing..."
                ) : (
                    <>
                        <ArrowDownLeft className="h-5 w-5 mr-2" />
                        Deposit ₦{amount || "0"}
                    </>
                )}
            </Button>
        </form>
    );
}
