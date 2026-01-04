"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Moon, Sun, Wallet } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (document.documentElement.classList.contains('dark')) {
                setTheme('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-sans transition-colors duration-300 p-4">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row h-full md:h-[800px] overflow-hidden rounded-xl shadow-2xl">

                {/* Left Side - Hero/Image */}
                <div className="hidden md:flex md:w-1/2 bg-primary relative flex-col justify-between p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 z-0"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-bold text-xl">G</div>
                            <h1 className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm">Gonana</h1>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-4">Empowering Agriculture Through Technology</h2>
                        <p className="text-lg text-white/90 font-light">Join the future of farming. Trade produce, secure payments with crypto & fiat, and verify your identity securely.</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Multi-Currency Wallet</h3>
                                <p className="text-sm text-white/80">Manage Fiat & Crypto seamlessly.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <div className="h-6 w-6 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Secure & Verified</h3>
                                <p className="text-sm text-white/80">Full KYC integration for safe trading.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 text-sm text-white/60">
                        © 2024 Gonana Marketplace. All rights reserved.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 bg-surface-light dark:bg-surface-dark p-8 md:p-16 flex flex-col justify-center relative transition-colors duration-300">
                    <button
                        className="absolute top-6 right-6 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6" />}
                    </button>

                    <div className="md:hidden flex justify-center mb-8">
                        <h1 className="font-display text-4xl font-bold text-primary dark:text-primary">Gonana</h1>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-500 dark:text-gray-400">Please enter your details to sign in.</p>
                        </div>

                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                            <button className="flex-1 pb-4 text-center font-medium text-primary border-b-2 border-primary focus:outline-none">Log In</button>
                            <button className="flex-1 pb-4 text-center font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors">Sign Up</button>
                        </div>

                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const email = e.currentTarget.email.value;
                            const password = e.currentTarget.password.value;
                            const result = await signIn("credentials", {
                                email,
                                password,
                                redirect: false,
                            });

                            if (result?.ok) {
                                setLoginError("");
                                router.push("/sell"); // Redirect to Sell page for demo
                            } else {
                                setLoginError("Invalid email or password");
                            }
                        }}>
                            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue="farmer@test.com"
                                        placeholder="farmer@example.com"
                                        className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
                                    <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        defaultValue="password"
                                        placeholder="••••••••"
                                        className="pl-10 block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 transition-colors outline-none"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me for 30 days</label>
                            </div>

                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.01]">
                                Sign in to Dashboard
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-surface-light dark:bg-surface-dark text-gray-500 dark:text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a href="#" className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                                    </svg>
                                    <span>Sign in with Google</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
