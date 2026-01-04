import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * Example API route showing how to verify Firebase tokens
 * and protect routes with authentication
 */

export async function GET(request: NextRequest) {
    try {
        // Get the token from the Authorization header
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];

        if (!token) {
            return NextResponse.json(
                { error: 'No authorization token provided' },
                { status: 401 }
            );
        }

        // Verify the token using Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Token is valid, you can access user data
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        return NextResponse.json({
            message: 'Authenticated successfully',
            user: {
                uid,
                email,
            },
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get the token
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];

        if (!token) {
            return NextResponse.json(
                { error: 'No authorization token provided' },
                { status: 401 }
            );
        }

        // Verify the token
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Get request body
        const body = await request.json();

        // Example: Save data to Firestore
        // const { adminDb } = await import('@/lib/firebase-admin');
        // await adminDb.collection('users').doc(uid).set(body);

        return NextResponse.json({
            message: 'Data saved successfully',
            uid,
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Operation failed' },
            { status: 500 }
        );
    }
}
