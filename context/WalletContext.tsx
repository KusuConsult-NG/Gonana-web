"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "NGN" | "USD" | "USDT" | "USDC";

interface WalletState {
    isKycVerified: boolean;
    balances: Record<Currency, number>;
    exchangeRate: number; // NGN per USD
}

interface WalletContextType extends WalletState {
    verifyKyc: () => void;
    topUp: (amount: number, currency: Currency) => void;
    deduct: (amount: number, currency: Currency) => boolean;
    convertPrice: (amount: number, sourceCurrency: Currency, targetCurrency: Currency) => number;
    formatPrice: (amount: number, currency: Currency) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    // Initial Mock State
    const [isKycVerified, setIsKycVerified] = useState(false);
    const [balances, setBalances] = useState<Record<Currency, number>>({
        NGN: 0,
        USD: 0,
        USDT: 0,
        USDC: 0
    });

    // Mock Exchange Rate: 1 USD = 1500 NGN
    const exchangeRate = 1500;

    // Load state from local storage on mount (simulation persistence)
    useEffect(() => {
        const storedKyc = localStorage.getItem("gonana_kyc");
        if (storedKyc) setIsKycVerified(storedKyc === "true");

        const storedBalances = localStorage.getItem("gonana_balances");
        if (storedBalances) setBalances(JSON.parse(storedBalances));
        else {
            // Default starting balance for testing
            setBalances({
                NGN: 2500000, // 2.5m NGN
                USD: 500,
                USDT: 1000,
                USDC: 1000
            });
        }
    }, []);

    // Persist changes
    useEffect(() => {
        localStorage.setItem("gonana_balances", JSON.stringify(balances));
    }, [balances]);

    useEffect(() => {
        localStorage.setItem("gonana_kyc", String(isKycVerified));
    }, [isKycVerified]);

    const verifyKyc = () => {
        setIsKycVerified(true);
    };

    const topUp = (amount: number, currency: Currency) => {
        setBalances(prev => ({
            ...prev,
            [currency]: prev[currency] + amount
        }));
    };

    const deduct = (amount: number, currency: Currency): boolean => {
        if (balances[currency] >= amount) {
            setBalances(prev => ({
                ...prev,
                [currency]: prev[currency] - amount
            }));
            return true;
        }
        return false;
    };

    const convertPrice = (amount: number, sourceCurrency: Currency, targetCurrency: Currency): number => {
        if (sourceCurrency === targetCurrency) return amount;

        // Convert source to USD first (Base)
        let amountInUSD = amount;
        if (sourceCurrency === "NGN") amountInUSD = amount / exchangeRate;
        // USDT/USDC are pegged to USD for this simulation 1:1

        // Convert USD to target
        if (targetCurrency === "NGN") return amountInUSD * exchangeRate;
        return amountInUSD;
    };

    const formatPrice = (amount: number, currency: Currency): string => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency === "USDT" || currency === "USDC" ? "USD" : currency, // Display stablecoins as USD symbol
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace("US$", "$"); // Simple cleanup
    };

    return (
        <WalletContext.Provider value={{
            isKycVerified,
            balances,
            exchangeRate,
            verifyKyc,
            topUp,
            deduct,
            convertPrice,
            formatPrice
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
