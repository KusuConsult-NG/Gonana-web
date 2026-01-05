"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") {
            setLoading(true);
            return;
        }

        if (session?.user) {
            // Map NextAuth session to a Firebase-like User object for compatibility
            setUser({
                uid: session.user.id || "",
                email: session.user.email || "",
                displayName: session.user.name || "",
                photoURL: session.user.image || "",
                emailVerified: true, // Assuming NextAuth verified it
                isAnonymous: false,
                metadata: {},
                providerData: [],
                refreshToken: "",
                tenantId: "",
                delete: async () => { },
                getIdToken: async () => "mock-token", // In a real app, this would get a custom token
                getIdTokenResult: async () => ({
                    token: "mock-token",
                    signInProvider: "custom",
                    claims: {},
                    authTime: new Date().toISOString(),
                    issuedAtTime: new Date().toISOString(),
                    expirationTime: new Date().toISOString(),
                }),
                reload: async () => { },
                toJSON: () => ({}),
            } as unknown as User);
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [session, status]);

    const signIn = async (email: string, password: string) => {
        try {
            const result = await nextAuthSignIn("credentials", {
                redirect: false,
                email,
                password
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push('/');
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signInWithToken = async (token: string) => {
        // Not used with NextAuth flow, but keeping for interface compatibility
        console.warn("signInWithToken not supported in NextAuth mode");
    };

    const signOut = async () => {
        try {
            await nextAuthSignOut({ redirect: true, callbackUrl: "/login" });
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, signInWithToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
