import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
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
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                // session.user.role = token.role; // Add role if needed
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
