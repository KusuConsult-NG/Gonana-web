import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const authOptions: NextAuthOptions = {
    // Removed PrismaAdapter - using JWT sessions with Firebase backend
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

                try {
                    // Verify password with Firebase Auth REST API
                    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
                    if (!apiKey) {
                        console.error("Missing Firebase API Key");
                        return null;
                    }

                    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                            returnSecureToken: true
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const authData = await authResponse.json();

                    if (!authResponse.ok || authData.error) {
                        console.error("Auth error:", authData.error);
                        return null;
                    }

                    const uid = authData.localId;

                    // Get user data from Firestore
                    const userDoc = await adminDb.collection('users').doc(uid).get();

                    if (!userDoc.exists) {
                        // Optional: Create user in Firestore if only in Auth (migration)
                        return {
                            id: uid,
                            email: credentials.email,
                            name: "User",
                            image: null
                        };
                    }

                    const userData = userDoc.data()!;
                    return {
                        id: uid,
                        email: userData.email,
                        name: userData.name,
                        image: userData.image || null,
                    };
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // When a user signs in with Google for the first time
            if (account?.provider === "google" && user.email) {
                try {
                    // Check if user exists in Firestore
                    const existingUserQuery = await adminDb.collection('users')
                        .where('email', '==', user.email)
                        .limit(1)
                        .get();

                    if (existingUserQuery.empty) {
                        // Create new user in Firestore
                        const newUserRef = adminDb.collection('users').doc();
                        await newUserRef.set({
                            email: user.email,
                            name: user.name || profile?.name || "User",
                            image: user.image || profile?.image || null,
                            role: "USER",
                            isKycVerified: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });

                        // Create wallet for new user
                        await adminDb.collection('wallets').doc(newUserRef.id).set({
                            userId: newUserRef.id,
                            balanceNGN: 0,
                            balanceUSD: 0,
                            balanceUSDT: 0,
                            balanceUSDC: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });

                        user.id = newUserRef.id;
                    } else {
                        // User exists, use existing ID
                        const existingUser = existingUserQuery.docs[0];
                        user.id = existingUser.id;

                        // Check if wallet exists
                        const walletDoc = await adminDb.collection('wallets').doc(existingUser.id).get();
                        if (!walletDoc.exists) {
                            await adminDb.collection('wallets').doc(existingUser.id).set({
                                userId: existingUser.id,
                                balanceNGN: 0,
                                balanceUSD: 0,
                                balanceUSDT: 0,
                                balanceUSDC: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            });
                        }
                    }
                } catch (error) {
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // On initial sign in
            if (user) {
                token.uid = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.uid as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
