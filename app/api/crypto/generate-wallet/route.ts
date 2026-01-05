import { NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { generateWalletForUser } from '@/lib/crypto/walletGenerator';
import { checkRateLimit, getIdentifier, createRateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

/**
 * API to generate crypto wallet after KYC completion
 * POST /api/crypto/generate-wallet
 */
export async function POST(req: Request) {
    try {
        // Verify authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyIdToken(token);
        const userId = decodedToken.uid;

        // Apply rate limiting
        const rateLimitResult = checkRateLimit(
            getIdentifier(req, userId),
            RATE_LIMITS.AUTHENTICATION
        );

        if (!rateLimitResult.allowed) {
            const response = createRateLimitResponse(rateLimitResult);
            return NextResponse.json(response.body, {
                status: response.status,
                headers: response.headers
            });
        }

        // Check user exists and is KYC verified
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data()!;

        // Check KYC status
        if (!userData.isKycVerified) {
            return NextResponse.json({
                error: 'KYC verification required',
                message: 'Complete KYC verification to generate crypto wallet'
            }, { status: 403 });
        }

        // Check if wallet already exists
        const cryptoWalletDoc = await adminDb.collection('cryptoWallets').doc(userId).get();
        if (cryptoWalletDoc.exists) {
            const existingWallet = cryptoWalletDoc.data()!;
            return NextResponse.json({
                message: 'Wallet already exists',
                alreadyExists: true,
                addresses: existingWallet.addresses,
            });
        }

        // Generate new wallet
        const { address, encrypted } = await generateWalletForUser(userId);

        // Store encrypted private key
        await adminDb.collection('encryptedKeys').doc(userId).set({
            userId,
            encryptedData: encrypted.encryptedData,
            iv: encrypted.iv,
            salt: encrypted.salt,
            authTag: encrypted.authTag,
            createdAt: new Date().toISOString(),
        });

        // Store public addresses (same address works for all EVM chains)
        const addresses = {
            ethereum: {
                address,
                network: 'ethereum',
                createdAt: new Date().toISOString(),
            },
            polygon: {
                address,
                network: 'polygon',
                createdAt: new Date().toISOString(),
            },
            bsc: {
                address,
                network: 'bsc',
                createdAt: new Date().toISOString(),
            },
        };

        await adminDb.collection('cryptoWallets').doc(userId).set({
            userId,
            addresses,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Update user record
        await adminDb.collection('users').doc(userId).update({
            walletGenerated: true,
            walletGeneratedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Crypto wallet generated successfully',
            addresses: {
                ethereum: address,
                polygon: address,
                bsc: address,
            },
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || 'Failed to generate wallet'
        }, { status: 500 });
    }
}

/**
 * GET user's crypto wallet addresses
 */
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyIdToken(token);
        const userId = decodedToken.uid;

        const cryptoWalletDoc = await adminDb.collection('cryptoWallets').doc(userId).get();

        if (!cryptoWalletDoc.exists) {
            return NextResponse.json({
                exists: false,
                message: 'No crypto wallet found. Complete KYC to generate one.'
            });
        }

        const walletData = cryptoWalletDoc.data()!;

        return NextResponse.json({
            exists: true,
            addresses: walletData.addresses,
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || 'Failed to fetch wallet'
        }, { status: 500 });
    }
}
