import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password, role } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password (in production, use proper password hashing)
        // For now, we'll store it as-is since this is a prototype
        // const hashedPassword = await hash(password, 10);

        // Create user with wallet
        const user = await prisma.user.create({
            data: {
                email,
                name: `${firstName} ${lastName}`,
                role: role?.toUpperCase() || 'FARMER',
                isKycVerified: false,
                wallet: {
                    create: {
                        balanceNGN: 0,
                        balanceUSD: 0,
                        balanceUSDT: 0,
                        balanceUSDC: 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 }
        );
    }
}
