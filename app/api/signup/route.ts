import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password, role, age, gender } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Map frontend role to database role
        const roleMap: Record<string, string> = {
            'buyer': 'USER',
            'seller': 'FARMER',
            'both': 'FARMER',
        };

        const dbRole = roleMap[role?.toLowerCase()] || 'USER';

        // Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            emailVerified: false,
        });

        // Create user document in Firestore
        const userData = {
            id: userRecord.uid,
            email,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            role: dbRole,
            age: age ? parseInt(age) : null,
            gender: gender || null,
            isKycVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('users').doc(userRecord.uid).set(userData);

        // Create wallet for user
        const walletData = {
            userId: userRecord.uid,
            balanceNGN: 0,
            balanceUSD: 0,
            balanceUSDT: 0,
            balanceUSDC: 0,
            createdAt: new Date().toISOString(),
        };

        await adminDb.collection('wallets').doc(userRecord.uid).set(walletData);

        return NextResponse.json({
            success: true,
            user: {
                id: userRecord.uid,
                email: userRecord.email,
                name: userData.name,
                role: userData.role,
            },
        });
    } catch (error: any) {
        console.error('Signup error:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        if (error.code === 'auth/invalid-email') {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        if (error.code === 'auth/weak-password') {
            return NextResponse.json(
                { error: 'Password is too weak. Use at least 6 characters.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 }
        );
    }
}
