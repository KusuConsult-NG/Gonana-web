"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "buyer" as "buyer" | "seller" | "both",
        agreeToTerms: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        if (!formData.agreeToTerms) {
            alert("Please agree to the terms and conditions");
            return;
        }

        setIsLoading(true);

        try {
            // Sign up by logging in with credentials
            // The auth system will auto-create the user on first login
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.ok) {
                router.push("/"); // Redirect to marketplace home
            } else {
                alert("Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred during signup");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding (same as login) */}
            <div className="hidden md:flex md:w-1/2 bg-primary relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 z-0"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">G</span>
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                            Gonana
                        </h1>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Join Africa's Leading Agricultural Marketplace
                    </h2>
                    <p className="text-lg text-white/90 font-light">
                        Create your account to buy or sell agricultural products, manage your farm,
                        and connect with a community of farmers and buyers across the continent.
                    </p>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Instant Payouts</h3>
                            <p className="text-sm text-white/80">Get paid in crypto or fiat instantly.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Join a Community</h3>
                            <p className="text-sm text-white/80">Connect with 10,000+ verified farmers.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 text-sm text-white/60">
                    © 2024 Gonana Marketplace. All rights reserved.
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full md:w-1/2 bg-surface-light dark:bg-surface-dark p-8 md:p-16 flex flex-col justify-center relative transition-colors duration-300 overflow-y-auto max-h-screen">
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    {theme === "dark" ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6" />}
                </button>

                {/* Mobile Logo */}
                <div className="md:hidden flex justify-center mb-6">
                    <h1 className="font-display text-4xl font-bold text-primary">Gonana</h1>
                </div>

                <div className="max-w-md mx-auto w-full">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
                            Create Account
                        </h2>
                        <p className="text-secondary-text-light dark:text-secondary-text-dark">
                            Join thousands of farmers and buyers trading today
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-border-light dark:border-border-dark mb-6">
                        <Link
                            href="/login"
                            className="flex-1 pb-4 text-center font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                        >
                            Log In
                        </Link>
                        <div className="flex-1 pb-4 text-center font-medium text-primary border-b-2 border-primary cursor-default">
                            Sign Up
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                            <Input
                                type="text"
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="farmer@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            leftIcon={<Mail className="h-4 w-4" />}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                                I am a
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["buyer", "seller", "both"].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center justify-center px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${formData.role === role
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border-light dark:border-border-dark text-secondary-text-light dark:text-secondary-text-dark hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={formData.role === role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            className="sr-only"
                                        />
                                        <span className="capitalize text-sm">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                leftIcon={<Lock className="h-4 w-4" />}
                                helperText="Must be at least 8 characters"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                leftIcon={<Lock className="h-4 w-4" />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                                required
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-text-light dark:text-text-dark">
                                I agree to the{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    {/* Social Signup */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-surface-light dark:bg-surface-dark text-secondary-text-light dark:text-secondary-text-dark">
                                    Or sign up with
                                </span>
                            </div>
                        </div>

                        <button className="w-full inline-flex justify-center py-2.5 px-4 border border-border-light dark:border-border-dark rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                            </svg>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-secondary-text-light dark:text-secondary-text-dark">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
