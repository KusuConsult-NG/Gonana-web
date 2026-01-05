import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchangeRates";

/**
 * GET /api/exchange-rates
 * Returns live cryptocurrency and fiat exchange rates
 * Rates are cached for 5 minutes to avoid API rate limits
 */
export async function GET() {
    try {
        const rates = await getExchangeRates();
        return NextResponse.json(rates);
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        return NextResponse.json(
            { error: "Failed to fetch exchange rates" },
            { status: 500 }
        );
    }
}
