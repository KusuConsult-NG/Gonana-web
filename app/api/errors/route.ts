import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        // IP extraction (X-Forwarded-For generally contains client IP in index 0)
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

        // Rate Limit (Use 'public' or custom limit)
        const limitInfo = await checkRateLimit(ip, 'public');

        if (!limitInfo.success) {
            return NextResponse.json({ error: "Too many requests", reason: limitInfo.reason }, { status: 429 });
        }

        const body = await req.json();
        const { error, context, url, userAgent } = body;

        // Log to Firestore
        await adminDb.collection('error_logs').add({
            error: error || 'Unknown Error',
            context: context || {},
            url: url || 'unknown',
            userAgent: userAgent || req.headers.get('user-agent'),
            ip,
            severity: body.severity || 'error',
            timestamp: new Date().toISOString(),
            resolved: false
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to log error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
