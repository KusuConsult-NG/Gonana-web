import { NextResponse } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface ExchangeRates {
    NGN_USD: number;
    ETH_USD: number;
    BNB_USD: number;
    MATIC_USD: number;
    USDT_USD: number;
    USDC_USD: number;
}

// Cache mechanism
let cachedRates: ExchangeRates | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

// Default fallback rates
const FALLBACK_RATES: ExchangeRates = {
    NGN_USD: 1 / 1500, // ₦1500 = $1
    ETH_USD: 2300,
    BNB_USD: 310,
    MATIC_USD: 0.85,
    USDT_USD: 1,
    USDC_USD: 1,
};

export async function getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();

    // Return cached rates if valid
    if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
        return cachedRates;
    }

    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=ethereum,binancecoin,matic-network,tether,usd-coin&vs_currencies=usd`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from CoinGecko');
        }

        const data = await response.json();

        // NGN rate typically needs a specialized API or manual update
        // For now, we'll keep the hardcoded NGN rate or fetch it if we had a source 
        // (CoinGecko NGN rate is often off/official rate, not market rate)
        // Let's stick to our reliable constant for NGN for now or use a separate logical fetch if needed.
        // Actually, let's try to get NGN from CoinGecko too if available, but usually parallel market differs.
        // We will stick to the configured constant for NGN to be safe/stable for this demo.

        cachedRates = {
            NGN_USD: FALLBACK_RATES.NGN_USD,
            ETH_USD: data.ethereum?.usd || FALLBACK_RATES.ETH_USD,
            BNB_USD: data.binancecoin?.usd || FALLBACK_RATES.BNB_USD,
            MATIC_USD: data['matic-network']?.usd || FALLBACK_RATES.MATIC_USD,
            USDT_USD: data.tether?.usd || 1,
            USDC_USD: data['usd-coin']?.usd || 1,
        };

        lastFetch = now;
        return cachedRates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return cachedRates || FALLBACK_RATES;
    }
}
