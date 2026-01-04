import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Note: Firebase Admin SDK doesn't have a direct "sign in with password" method
        // This is because authentication should happen on the client side
        // We'll verify the user exists and return a custom token

        try {
            // Get user by email
            const userRecord = await adminAuth.getUserByEmail(email);

            // Get user data from Firestore
            const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();

            if (!userDoc.exists) {
                // User exists in Auth but not Firestore, create document
                const userData = {
                    id: userRecord.uid,
                    email: userRecord.email!,
                    name: userRecord.displayName || 'User',
                    role: 'USER',
                    isKycVerified: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                await adminDb.collection('users').doc(userRecord.uid).set(userData);

                // Create wallet
                await adminDb.collection('wallets').doc(userRecord.uid).set({
                    userId: userRecord.uid,
                    balanceNGN: 0,
                    balanceUSD: 0,
                    balanceUSDT: 0,
                    balanceUSDC: 0,
                    createdAt: new Date().toISOString(),
                });
            }

            // Create custom token for client-side sign-in
            const customToken = await adminAuth.createCustomToken(userRecord.uid);

            return NextResponse.json({
                success: true,
                customToken,
                user: {
                    id: userRecord.uid,
                    email: userRecord.email,
                    name: userRecord.displayName,
                },
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
