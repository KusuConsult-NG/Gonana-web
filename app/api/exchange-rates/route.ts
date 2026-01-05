import { NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/crypto/exchangeRates';

export const dynamic = 'force-dynamic'; // Prevent static caching of the endpoint itself

export async function GET() {
    const rates = await getExchangeRates();
    return NextResponse.json({ rates });
}
