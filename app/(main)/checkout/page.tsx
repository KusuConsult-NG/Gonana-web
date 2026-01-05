"use client";

import Link from "next/link";
import Image from "next/image";
import { CreditCard, Wallet, CheckCircle, ChevronRight, Lock, Sprout } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { PriceTag } from "@/components/ui/PriceTag";
import { initializePaystackPayment, convertToKobo } from "@/lib/paystack";

export default function CheckoutPage() {
    const { isKycVerified, balances, deduct, exchangeRate, formattedRates } = useWallet();
    const { data: session } = useSession();
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<"fiat" | "crypto">("fiat");
    const [selectedWalletCurrency, setSelectedWalletCurrency] = useState<"NGN" | "USDT" | "USDC" | "ETH" | "BNB" | "MATIC">("USDT");
    const [selectedNetwork, setSelectedNetwork] = useState<"ethereum" | "polygon" | "bsc">("polygon"); // Default to Polygon (cheapest)
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingData, setShippingData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: ""
    });

    const { items, subtotal, clearCart } = useCart();

    // Derived state
    const shippingCost = 2500; // Simplified logic mapping to API
    const tax = subtotal * 0.05;
    const total = subtotal + shippingCost + tax;

    // Calculate total in different currencies
    const totalInNGN = total;
    const totalInUSD = total * formattedRates.NGN_USD;

    const getCryptoAmount = (currency: string) => {
        if (currency === 'NGN') return totalInNGN;
        if (currency === 'USDT' || currency === 'USDC') return totalInUSD;
        if (currency === 'ETH') return totalInUSD / formattedRates.ETH_USD;
        if (currency === 'BNB') return totalInUSD / formattedRates.BNB_USD;
        if (currency === 'MATIC') return totalInUSD / formattedRates.MATIC_USD;
        return 0;
    };

    const handlePay = async () => {
        if (!session) {
            alert("Please login to complete your purchase.");
            router.push("/login?callbackUrl=/checkout");
            return;
        }

        // Validate shipping data
        if (!shippingData.fullName || !shippingData.phone || !shippingData.address || !shippingData.city || !shippingData.state) {
            alert("Please fill in all required shipping information (Name, Phone, Address, City, State)");
            return;
        }

        setIsProcessing(true);

        try {
            if (paymentMethod === "fiat") {
                // Paystack Card Payment
                const userEmail = session.user?.email || "buyer@gonana.farm";

                initializePaystackPayment(
                    {
                        email: userEmail,
                        amount: convertToKobo(total), // Convert NGN to kobo
                        currency: "NGN",
                        metadata: {
                            cart_items: items.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                            })),
                            shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}${shippingData.postalCode ? ', ' + shippingData.postalCode : ''}`,
                            delivery_method: "logistics",
                        },
                    },
                    async (response) => {
                        // Payment successful - verify and create order

                        try {
                            // Create order with payment reference
                            const res = await fetch("/api/orders", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    items,
                                    address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}${shippingData.postalCode ? ', ' + shippingData.postalCode : ''}`,
                                    logistics: "logistics",
                                    totalAmount: total,
                                    paymentReference: response.reference,
                                    paymentMethod: "paystack",
                                }),
                            });

                            if (res.ok) {
                                const order = await res.json();
                                clearCart();
                                router.push(`/order-confirmation/${order.id}`);
                            } else {
                                const err = await res.json();
                                alert(`Order creation failed: ${err.error}`);
                            }
                        } catch (error) {
                            console.error(error);
                            alert("Order creation failed. Please contact support with reference: " + response.reference);
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                    () => {
                        // User closed popup
                        setIsProcessing(false);
                    }
                );
            } else {
                // Crypto/Wallet Payment
                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items,
                        address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}${shippingData.postalCode ? ', ' + shippingData.postalCode : ''}`,
                        logistics: "logistics",
                        totalAmount: total,
                        paymentMethod: "wallet",
                        walletCurrency: selectedWalletCurrency,
                        network: selectedWalletCurrency !== "NGN" ? selectedNetwork : undefined,
                    }),
                });

                if (res.ok) {
                    const order = await res.json();
                    clearCart();
                    router.push(`/order-confirmation/${order.id}`);
                } else {
                    const err = await res.json();
                    alert(`Order Failed: ${err.error}`);
                }
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="mb-8">
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/cart" className="inline-flex items-center text-sm font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-primary">
                                Cart
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <span className="ml-1 text-sm font-medium text-secondary-text-light dark:text-secondary-text-dark md:ml-2">Shipping</span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <span className="ml-1 text-sm font-medium text-primary md:ml-2">Payment</span>
                            </div>
                        </li>
                    </ol>
                </nav>
                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark mt-4">Secure Checkout</h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark mt-2">Complete your purchase of agricultural supplies securely.</p>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <section className="lg:col-span-7 space-y-8">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                        <div className="p-6 border-b border-border-light dark:border-border-dark">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-semibold text-secondary-text-light dark:text-secondary-text-dark uppercase tracking-wide">Shipping To</h3>
                                    <p className="mt-1 text-text-light dark:text-text-dark font-medium">
                                        {shippingData.fullName || 'Please fill shipping form below'}
                                    </p>
                                    {shippingData.address && (
                                        <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                                            {shippingData.address}, {shippingData.city}, {shippingData.state}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-secondary-text-light dark:text-secondary-text-dark uppercase tracking-wide mb-4">Delivery Service</h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 rounded-lg border border-primary bg-primary/5 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="shipping" defaultChecked className="h-4 w-4 text-primary focus:ring-primary" />
                                        <div>
                                            <p className="font-bold text-text-light dark:text-text-dark">GIG Logistics</p>
                                            <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark">Standard Delivery (3-5 Days)</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-text-light dark:text-text-dark">₦2,500.00</span>
                                </label>
                                <label className="flex items-center justify-between p-4 rounded-lg border border-border-light dark:border-border-dark hover:border-primary cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="shipping" className="h-4 w-4 text-primary focus:ring-primary" />
                                        <div>
                                            <p className="font-bold text-text-light dark:text-text-dark">TopShip Express</p>
                                            <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark">Next Day Delivery</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-text-light dark:text-text-dark">₦4,500.00</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-6">Payment Method</h2>

                        <div className="flex space-x-1 bg-background-light dark:bg-background-dark p-1 rounded-lg mb-6 border border-border-light dark:border-border-dark">
                            <button
                                onClick={() => setPaymentMethod("fiat")}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md shadow transition-colors",
                                    paymentMethod === "fiat" ? "bg-surface-light dark:bg-surface-dark text-primary" : "text-secondary-text-light dark:text-secondary-text-dark hover:text-text-light dark:hover:text-text-dark"
                                )}
                            >
                                <CreditCard className="mr-2 h-5 w-5" /> Fiat (Card/Bank)
                            </button>
                            <button
                                onClick={() => setPaymentMethod("crypto")}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md shadow transition-colors",
                                    paymentMethod === "crypto" ? "bg-surface-light dark:bg-surface-dark text-primary" : "text-secondary-text-light dark:text-secondary-text-dark hover:text-text-light dark:hover:text-text-dark"
                                )}
                            >
                                <Wallet className="mr-2 h-5 w-5" /> Gonana Wallet
                            </button>
                        </div>

                        {paymentMethod === "fiat" ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-primary bg-primary/5 p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold text-text-light dark:text-text-dark mb-2">
                                                Secure Card Payment via Paystack
                                            </h4>
                                            <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mb-3">
                                                Pay safely with Visa, Mastercard, Verve, or Bank Transfer. Powered by Paystack.
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-secondary-text-light dark:text-secondary-text-dark">
                                                <Lock className="h-3 w-3" />
                                                <span>256-bit SSL encrypted • PCI-DSS compliant</span>
                                            </div>
                                        </div>
                                        <Sprout className="h-8 w-8 text-primary opacity-30" />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border-light dark:border-border-dark">
                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-border-light dark:border-border-dark">💳 Card</span>
                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-border-light dark:border-border-dark">🏦 Bank Transfer</span>
                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-border-light dark:border-border-dark">📱 USSD</span>
                                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-border-light dark:border-border-dark">📲 Mobile Money</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                        <span className="text-lg">ℹ️</span>
                                        <span>Click <strong>Pay Now</strong> below to open the secure Paystack payment window. No card details are stored on our servers.</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-text-light dark:text-text-dark">Pay with Wallet Balance</h3>
                                        <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded-full">Custodial</span>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                            Select currency to pay with:
                                            <span className="ml-2 text-xs font-normal text-gray-500">
                                                (Order Total: <span className="font-bold text-primary">₦{total.toLocaleString()}</span> / ${totalInUSD.toFixed(2)})
                                            </span>
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Wallets selection with all cryptos */}
                                            {[
                                                { symbol: 'NGN', name: 'Nigerian Naira', icon: '₦', balance: balances.NGN, color: 'bg-green-500' },
                                                { symbol: 'USDT', name: 'Tether USD', icon: '₮', balance: balances.USDT, color: 'bg-teal-500' },
                                                { symbol: 'USDC', name: 'USD Coin', icon: '$', balance: balances.USDC, color: 'bg-blue-500' },
                                                { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', balance: balances.ETH || 0, color: 'bg-indigo-500' },
                                                { symbol: 'BNB', name: 'BNB', icon: 'B', balance: balances.BNB || 0, color: 'bg-yellow-500' },
                                                { symbol: 'MATIC', name: 'Polygon', icon: 'M', balance: balances.MATIC || 0, color: 'bg-purple-500' },
                                            ].map((curr) => {
                                                const paymentAmount = getCryptoAmount(curr.symbol);
                                                const hasEnough = curr.balance >= paymentAmount;

                                                return (
                                                    <label key={curr.symbol} className={cn(
                                                        "relative flex cursor-pointer rounded-lg border bg-surface-light dark:bg-surface-dark p-4 shadow-sm hover:border-primary transition-all",
                                                        selectedWalletCurrency === curr.symbol ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border-light dark:border-border-dark",
                                                        !hasEnough && "opacity-60"
                                                    )}>
                                                        <input
                                                            type="radio"
                                                            name="wallet-currency"
                                                            value={curr.symbol}
                                                            className="sr-only peer"
                                                            checked={selectedWalletCurrency === curr.symbol}
                                                            onChange={() => setSelectedWalletCurrency(curr.symbol as any)}
                                                            disabled={!hasEnough}
                                                        />
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 ${curr.color} rounded-full flex items-center justify-center font-bold text-white shadow-md text-lg`}>
                                                                    {curr.icon}
                                                                </div>
                                                                <div>
                                                                    <span className="block text-sm font-bold text-text-light dark:text-text-dark">{curr.symbol}</span>
                                                                    <span className="block text-xs text-gray-500">{curr.name}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-xs text-gray-500">Balance:</span>
                                                                <span className="text-sm font-bold text-text-light dark:text-text-dark">
                                                                    {curr.symbol === 'NGN' ? `₦${curr.balance.toLocaleString()}` :
                                                                        curr.symbol === 'ETH' || curr.symbol === 'BNB' || curr.symbol === 'MATIC' ?
                                                                            `${curr.balance.toFixed(4)} ${curr.symbol}` :
                                                                            `$${curr.balance.toLocaleString()}`}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs font-semibold",
                                                                    hasEnough ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                                )}>
                                                                    Pay: {curr.symbol === 'NGN' ? `₦${paymentAmount.toLocaleString()}` :
                                                                        curr.symbol === 'ETH' || curr.symbol === 'BNB' || curr.symbol === 'MATIC' ?
                                                                            `${paymentAmount.toFixed(6)} ${curr.symbol}` :
                                                                            `$${paymentAmount.toFixed(2)}`}
                                                                </span>
                                                                {curr.symbol !== 'NGN' && (
                                                                    <span className="text-[10px] text-gray-400">
                                                                        ≈ ${curr.symbol === 'USDT' || curr.symbol === 'USDC' ? paymentAmount.toFixed(2) : (paymentAmount * (curr.symbol === 'ETH' ? formattedRates.ETH_USD : curr.symbol === 'BNB' ? formattedRates.BNB_USD : formattedRates.MATIC_USD)).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!hasEnough && (
                                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                                                                Insufficient
                                                            </div>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Network Selection for All Crypto */}
                                        {selectedWalletCurrency !== 'NGN' && (
                                            <div className="space-y-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                                <p className="text-sm font-medium text-text-light dark:text-text-dark">Select Network:</p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'polygon', name: 'Polygon', symbol: 'MATIC', fee: '$0.01', color: 'bg-purple-500', recommended: true },
                                                        { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', fee: '$0.10', color: 'bg-yellow-500' },
                                                        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', fee: '$5', color: 'bg-blue-500' },
                                                    ].map((network) => (
                                                        <label key={network.id} className={cn(
                                                            "relative flex flex-col cursor-pointer rounded-lg border p-3 shadow-sm hover:border-primary transition-all",
                                                            selectedNetwork === network.id ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border-light dark:border-border-dark"
                                                        )}>
                                                            <input
                                                                type="radio"
                                                                name="network"
                                                                value={network.id}
                                                                className="sr-only"
                                                                checked={selectedNetwork === network.id}
                                                                onChange={() => setSelectedNetwork(network.id as "ethereum" | "polygon" | "bsc")}
                                                            />
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className={`w-10 h-10 ${network.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                                                    {network.symbol[0]}
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-xs font-semibold text-text-light dark:text-text-dark">{network.name}</div>
                                                                    <div className="text-[10px] text-gray-500">Fee: {network.fee}</div>
                                                                    {network.recommended && (
                                                                        <div className="text-[9px] text-green-600 dark:text-green-400 font-bold mt-0.5">Recommended</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                                                    <p className="text-[11px] text-yellow-800 dark:text-yellow-200">
                                                        ⚠️ Make sure your {selectedWalletCurrency} is on the <strong>{selectedNetwork === 'ethereum' ? 'Ethereum' : selectedNetwork === 'polygon' ? 'Polygon' : 'BNB Chain'}</strong> network
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm p-3 bg-surface-light dark:bg-surface-dark rounded border border-border-light dark:border-border-dark">
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark">Zero Transaction Fees within Gonana.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {isKycVerified && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Identity Verified</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Your KYC status is active. High-value transactions are enabled.</p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="lg:col-span-5 mt-10 lg:mt-0">
                    <div className="sticky top-24">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="p-6 bg-primary/5 border-b border-border-light dark:border-border-dark">
                                <h2 className="text-lg font-bold text-text-light dark:text-text-dark">Order Summary</h2>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">Order #GN-7829-XJ</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <ul className="divide-y divide-border-light dark:divide-border-dark">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex py-4 first:pt-0">
                                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border-light dark:border-border-dark bg-white">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-text-light dark:text-text-dark">
                                                        <h3><Link href={`/ product / ${item.id} `}>{item.name}</Link></h3>
                                                        <p className="ml-4"><PriceTag amount={item.price * item.quantity} currency="NGN" /></p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-secondary-text-light dark:text-secondary-text-dark">{item.unit}</p>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                    <p className="text-secondary-text-light dark:text-secondary-text-dark">Qty {item.quantity}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-border-light dark:border-border-dark pt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Subtotal</dt>
                                        <dd className="text-sm font-medium text-text-light dark:text-text-dark"><PriceTag amount={subtotal} currency="NGN" /></dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Shipping</dt>
                                        <dd className="text-sm font-medium text-text-light dark:text-text-dark"><PriceTag amount={shippingCost} currency="NGN" /></dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-secondary-text-light dark:text-secondary-text-dark">Taxes</dt>
                                        <dd className="text-sm font-medium text-text-light dark:text-text-dark"><PriceTag amount={tax} currency="NGN" /></dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-6">
                                        <dt className="text-base font-bold text-text-light dark:text-text-dark">Total</dt>
                                        <dd className="text-base font-bold text-primary"><PriceTag amount={total} currency="NGN" /></dd>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
                                <button
                                    onClick={handlePay}
                                    disabled={isProcessing}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isProcessing ? (
                                        "Processing..."
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5" /> Proceed to Payment
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-secondary-text-light dark:text-secondary-text-dark mt-4">
                                    By placing this order, you agree to Gonana&apos;s <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
