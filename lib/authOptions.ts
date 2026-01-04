import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // Only add Google provider if credentials are configured
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                authorization: {
                    params: {
                        prompt: "consent",
                        access_type: "offline",
                        response_type: "code"
                    }
                }
            })]
            : []
        ),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Mock Login for proto (In production, hash/compare passwords)
                // Find or create mock user
                const user = await prisma.user.upsert({
                    where: { email: credentials.email },
                    update: {},
                    create: {
                        email: credentials.email,
                        name: "Gonana User",
                        role: "FARMER",
                        isKycVerified: true,
                        wallet: {
                            create: {
                                balanceNGN: 50000,
                                balanceUSD: 100,
                                balanceUSDT: 50,
                                balanceUSDC: 25,
                            }
                        }
                    }
                });

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // When a user signs in with Google for the first time
            if (account?.provider === "google" && user.email) {
                // Check if user has a wallet, if not create one
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    include: { wallet: true }
                });

                if (existingUser && !existingUser.wallet) {
                    await prisma.wallet.create({
                        data: {
                            userId: existingUser.id,
                            balanceNGN: 0,
                            balanceUSD: 0,
                            balanceUSDT: 0,
                            balanceUSDC: 0,
                        }
                    });
                }
            }
            return true;
        },
        async session({ session, token, user }) {
            if (session.user) {
                session.user.id = token.sub!;
                // Add custom fields if needed
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
