"use client";

import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";

interface PriceTagProps {
    amount: number;
    currency: "NGN" | "USD" | "USDT" | "USDC";
    className?: string;
    showDual?: boolean;
}

export function PriceTag({ amount, currency, className, showDual = true }: PriceTagProps) {
    const { convertPrice, formatPrice } = useWallet();

    const mainPrice = formatPrice(amount, currency);

    // If currency is NGN, show USD equivalent. If USD/Stable, show NGN equivalent.
    const secondaryCurrency = currency === "NGN" ? "USD" : "NGN";
    const secondaryAmount = convertPrice(amount, currency, secondaryCurrency);
    const secondaryPrice = formatPrice(secondaryAmount, secondaryCurrency);

    return (
        <div className={cn("flex flex-col items-start leading-tight", className)}>
            <span className="font-bold text-lg">{mainPrice}</span>
            {showDual && (
                <span className="text-xs text-gray-500 font-medium">
                    ≈ {secondaryPrice}
                </span>
            )}
        </div>
    );
}
