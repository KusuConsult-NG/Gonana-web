"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { ExchangeRates } from "@/lib/crypto/exchangeRates";

type Currency = "NGN" | "USD" | "USDT" | "USDC" | "ETH" | "BNB" | "MATIC";

interface WalletState {
    isKycVerified: boolean;
    balances: Record<Currency, number>;
    formattedRates: ExchangeRates; // Live rates
    exchangeRate: number; // NGN per USD (Backward compatibility)
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
        USDC: 0,
        ETH: 0,
        BNB: 0,
        MATIC: 0
    });

    const [formattedRates, setFormattedRates] = useState<ExchangeRates>({
        NGN_USD: 1 / 1500,
        ETH_USD: 2300,
        BNB_USD: 310,
        MATIC_USD: 0.85,
        USDT_USD: 1,
        USDC_USD: 1,
    });

    // Fetch live rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('/api/exchange-rates');
                const data = await res.json();
                if (data.rates) {
                    setFormattedRates(data.rates);
                }
            } catch (error) {
                console.error("Failed to fetch rates:", error);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

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
                USDC: 1000,
                ETH: 0.5, // 0.5 ETH (~$1150)
                BNB: 3, // 3 BNB (~$930)
                MATIC: 1000 // 1000 MATIC (~$850)
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

        switch (sourceCurrency) {
            case "NGN": amountInUSD = amount * formattedRates.NGN_USD; break;
            case "ETH": amountInUSD = amount * formattedRates.ETH_USD; break;
            case "BNB": amountInUSD = amount * formattedRates.BNB_USD; break;
            case "MATIC": amountInUSD = amount * formattedRates.MATIC_USD; break;
            case "USDT":
            case "USDC":
            case "USD": amountInUSD = amount; break;
        }

        // Convert USD to target
        if (targetCurrency === "USD" || targetCurrency === "USDT" || targetCurrency === "USDC") return amountInUSD;
        if (targetCurrency === "NGN") return amountInUSD / formattedRates.NGN_USD;
        if (targetCurrency === "ETH") return amountInUSD / formattedRates.ETH_USD;
        if (targetCurrency === "BNB") return amountInUSD / formattedRates.BNB_USD;
        if (targetCurrency === "MATIC") return amountInUSD / formattedRates.MATIC_USD;

        return amountInUSD;
    };

    const formatPrice = (amount: number, currency: Currency): string => {
        if (currency === "ETH" || currency === "BNB" || currency === "MATIC") {
            return `${amount.toFixed(6)} ${currency}`;
        }

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
            formattedRates,
            exchangeRate: 1 / formattedRates.NGN_USD, // Backwards compatibility for NGN/USD
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
