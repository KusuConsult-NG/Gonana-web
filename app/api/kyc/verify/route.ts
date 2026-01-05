import { NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { prembly } from '@/lib/prembly';
import { generateWalletForUser } from '@/lib/crypto/walletGenerator';
import { checkRateLimit } from '@/lib/rateLimit';

// Map frontend document types to Prembly types
const DOC_TYPE_MAPPING: Record<string, "NIN" | "BVN" | "DRIVERS_LICENSE" | "PASSPORT"> = {
    "national_id": "NIN",
    "drivers_license": "DRIVERS_LICENSE",
    "passport": "PASSPORT",
    // "bvn": "BVN" // If we support BVN
};

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyIdToken(token);
        const userId = decodedToken.uid;

        // 2. Rate Limit
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        const rl = await checkRateLimit(ip, 'kyc' as any);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const body = await req.json();
        const { documentType, documentNumber, image } = body;

        if (!documentType || !documentNumber) {
            return NextResponse.json({ error: "Missing document details" }, { status: 400 });
        }

        // 3. Verify Identity with Prembly
        // Note: In a real app, we would pass first/last name from user profile for matching
        const verificationType = DOC_TYPE_MAPPING[documentType];
        if (!verificationType) {
            return NextResponse.json({ error: "Unsupported document type" }, { status: 400 });
        }

        const verifyResult = await prembly.verifyIdentity(verificationType, documentNumber);

        if (!verifyResult.status) {
            return NextResponse.json({
                error: "Identity Verification Failed",
                details: verifyResult.message
            }, { status: 400 });
        }

        // 4. Update User Profile (KYC Verified)
        await adminDb.collection('users').doc(userId).update({
            isKycVerified: true,
            kycVerifiedAt: new Date().toISOString(),
            kycDocumentType: documentType,
            // In a real app, store the secure URL of the uploaded image
            // kycImageUrl: image 
        });

        // 5. Generate Crypto Wallet automatically
        let cryptoWallet = null;
        try {
            const { address, encrypted } = await generateWalletForUser(userId);

            // Store encrypted keys
            await adminDb.collection('encryptedKeys').doc(userId).set({
                userId,
                encryptedData: encrypted.encryptedData,
                iv: encrypted.iv,
                salt: encrypted.salt,
                authTag: encrypted.authTag,
                createdAt: new Date().toISOString(),
            });

            // Store addresses
            const addresses = {
                ethereum: { address, network: 'ethereum', createdAt: new Date().toISOString() },
                polygon: { address, network: 'polygon', createdAt: new Date().toISOString() },
                bsc: { address, network: 'bsc', createdAt: new Date().toISOString() },
            };

            await adminDb.collection('cryptoWallets').doc(userId).set({
                userId,
                addresses,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            // Update user flag
            await adminDb.collection('users').doc(userId).update({
                walletGenerated: true,
                walletGeneratedAt: new Date().toISOString(),
            });

            cryptoWallet = addresses;
        } catch (e) {
            console.error("Crypto Wallet Generation Failed during KYC:", e);
            // Don't fail the whole request, but log it. User can retry wallet gen later.
        }

        // 6. Generate Fiat Wallet (Mock/Placeholder for Paystack Virtual Account)
        // Ideally, we call Paystack API to create a Dedicated NUBAN here.
        const fiatWallet = {
            bankName: "Gonana Virtual Bank",
            accountNumber: "99" + Math.floor(Math.random() * 100000000), // Mock
            accountName: "Gonana User " + userId.substring(0, 4)
        };

        await adminDb.collection('fiatWallets').doc(userId).set({
            userId,
            ...fiatWallet,
            provider: "paystack", // or prembly
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: "Identity Verified & Wallets Generated",
            cryptoWallet,
            fiatWallet
        });

    } catch (error: any) {
        console.error("KYC Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
