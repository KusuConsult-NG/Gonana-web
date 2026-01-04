// Type Definitions for Gonana Marketplace

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: "NGN" | "USD" | "KES" | "GHS";
    unit: string;
    minOrder?: string;
    image: string;
    images?: string[];
    rating: number;
    reviewCount?: number;
    seller: Seller;
    verified: boolean;
    tag?: string;
    colors?: string;
    stock: number;
    location: string;
    paymentMethods: string[];
    shippingOptions: ShippingOption[];
    specifications?: Record<string, string>;
}

export interface Seller {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    kycVerified: boolean;
    location: string;
    joinedDate: string;
}

export interface ShippingOption {
    id: string;
    name: string;
    provider: string;
    estimatedDays: string;
    price: number;
    currency: string;
    insured: boolean;
    description?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string;
    avatar?: string;
    phoneNumber?: string;
    address?: Address;
    kycStatus: "pending" | "verified" | "rejected" | "not_started";
    role: "buyer" | "seller" | "both";
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface UserPreferences {
    currency: "NGN" | "USD" | "KES" | "GHS";
    language: "en" | "fr" | "sw" | "yo";
    cryptoPaymentsEnabled: boolean;
    notifications: NotificationPreferences;
    theme: "light" | "dark" | "system";
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    marketing: boolean;
    newMessages: boolean;
    feedActivity: boolean;
}

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    selectedShipping?: ShippingOption;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    paymentMethod: PaymentMethod;
    paymentStatus: "pending" | "completed" | "failed";
    shippingAddress: Address;
    shippingOption: ShippingOption;
    createdAt: string;
    updatedAt: string;
    trackingNumber?: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    sellerId: string;
    sellerName: string;
}

export interface PaymentMethod {
    type: "card" | "bank" | "crypto" | "wallet";
    details: CardPayment | CryptoPayment | WalletPayment;
}

export interface CardPayment {
    cardNumber: string; // masked, e.g., "**** **** **** 1234"
    expiryDate: string;
    cardType: "visa" | "mastercard" | "verve";
}

export interface CryptoPayment {
    network: "Polygon" | "Ethereum" | "Binance Smart Chain" | "Celo";
    token: "USDC" | "USDT" | "GNA" | "ETH" | "MATIC";
    walletAddress: string;
    transactionHash?: string;
}

export interface WalletPayment {
    walletType: "gonana" | "paystack";
    balance: number;
}

export interface WalletBalance {
    NGN: number;
    USD: number;
    USDT: number;
    USDC: number;
    ETH: number;
    totalUSD: number;
}

export interface Transaction {
    id: string;
    type: "deposit" | "withdrawal" | "purchase" | "sale" | "tip";
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed";
    description: string;
    timestamp: string;
    from?: string;
    to?: string;
    transactionHash?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: "order" | "message" | "wallet" | "system" | "feed";
    title: string;
    message: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    color?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface FeedPost {
    id: string;
    author: User;
    content: string;
    images?: string[];
    video?: string;
    productId?: string; // If listing a product
    product?: Product;
    likes: number;
    comments: number;
    shares: number;
    liked: boolean; // by current user
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    type: "text" | "product" | "news" | "event";
}

export interface Comment {
    id: string;
    postId: string;
    author: User;
    content: string;
    likes: number;
    liked: boolean;
    createdAt: string;
    replies?: Comment[];
}

export interface KYCDocument {
    id: string;
    userId: string;
    documentType: "passport" | "national_id" | "drivers_license";
    documentNumber: string;
    expiryDate: string;
    frontImage: string;
    backImage?: string;
    status: "pending" | "verified" | "rejected";
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    productCount: number;
    parent?: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// Form types
export interface LoginForm {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface SignupForm {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: "buyer" | "seller" | "both";
    agreeToTerms: boolean;
}

export interface ProductForm {
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    unit: string;
    minOrder?: string;
    stock: number;
    images: File[];
    location: string;
    specifications?: Record<string, string>;
}

export interface ProfileEditForm {
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    phoneNumber?: string;
    address?: Address;
    avatar?: File;
}
