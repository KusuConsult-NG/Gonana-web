/**
 * Exchange Rate Service
 * Fetches live cryptocurrency and fiat exchange rates
 * Uses CoinGecko API (free tier - 10-50 calls/minute)
 */

interface ExchangeRates {
    NGN_USD: number;
    ETH_USD: number;
    BNB_USD: number;
    MATIC_USD: number;
    USDT_USD: number;
    USDC_USD: number;
    timestamp: string;
}

interface CachedRates {
    rates: ExchangeRates;
    expiresAt: number;
}

// Cache rates for 5 minutes to avoid hitting API limits
let cachedRates: CachedRates | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live exchange rates from CoinGecko API
 */
async function fetchLiveRates(): Promise<ExchangeRates> {
    try {
        // CoinGecko API - free tier, no API key needed
        // Docs: https://www.coingecko.com/en/api/documentation
        const cryptoResponse = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,matic-network,tether,usd-coin&vs_currencies=usd',
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!cryptoResponse.ok) {
            throw new Error(`CoinGecko API error: ${cryptoResponse.status}`);
        }

        const cryptoData = await cryptoResponse.json();

        // Fetch NGN/USD rate from exchangerate-api.com (free tier)
        const fiatResponse = await fetch(
            'https://api.exchangerate-api.com/v4/latest/USD'
        );

        if (!fiatResponse.ok) {
            throw new Error(`Exchange rate API error: ${fiatResponse.status}`);
        }

        const fiatData = await fiatResponse.json();
        const NGN_USD = 1 / (fiatData.rates.NGN || 1500); // Fallback to 1500 if API fails

        return {
            NGN_USD,
            ETH_USD: cryptoData.ethereum?.usd || 3500,
            BNB_USD: cryptoData.binancecoin?.usd || 600,
            MATIC_USD: cryptoData['matic-network']?.usd || 0.75,
            USDT_USD: cryptoData.tether?.usd || 1.0,
            USDC_USD: cryptoData['usd-coin']?.usd || 1.0,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to fetch live exchange rates:', error);

        // Fallback to reasonable defaults if API fails
        return {
            NGN_USD: 1 / 1500, // 1 USD = 1500 NGN
            ETH_USD: 3500,
            BNB_USD: 600,
            MATIC_USD: 0.75,
            USDT_USD: 1.0,
            USDC_USD: 1.0,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Get exchange rates with caching
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();

    // Return cached rates if still valid
    if (cachedRates && now < cachedRates.expiresAt) {
        return cachedRates.rates;
    }

    // Fetch fresh rates
    const rates = await fetchLiveRates();

    // Update cache
    cachedRates = {
        rates,
        expiresAt: now + CACHE_DURATION
    };

    return rates;
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
): Promise<number> {
    const rates = await getExchangeRates();

    // Convert to USD first (common base)
    let amountInUSD = amount;

    switch (fromCurrency) {
        case 'NGN':
            amountInUSD = amount * rates.NGN_USD;
            break;
        case 'ETH':
            amountInUSD = amount * rates.ETH_USD;
            break;
        case 'BNB':
            amountInUSD = amount * rates.BNB_USD;
            break;
        case 'MATIC':
            amountInUSD = amount * rates.MATIC_USD;
            break;
        case 'USDT':
        case 'USDC':
        case 'USD':
            amountInUSD = amount; // Already in USD
            break;
    }

    // Convert from USD to target currency
    switch (toCurrency) {
        case 'NGN':
            return amountInUSD / rates.NGN_USD;
        case 'ETH':
            return amountInUSD / rates.ETH_USD;
        case 'BNB':
            return amountInUSD / rates.BNB_USD;
        case 'MATIC':
            return amountInUSD / rates.MATIC_USD;
        case 'USDT':
        case 'USDC':
        case 'USD':
            return amountInUSD;
        default:
            return amountInUSD;
    }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearRateCache(): void {
    cachedRates = null;
}
