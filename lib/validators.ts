// Input Validation Utilities

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate price/amount (must be positive number)
 */
export function isValidAmount(amount: number, min: number = 0, max?: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount) || amount < min) {
        return false;
    }
    if (max !== undefined && amount > max) {
        return false;
    }
    return true;
}

/**
 * Validate product quantity
 */
export function isValidQuantity(quantity: number): boolean {
    return isValidAmount(quantity, 0.01, 1000000);
}

/**
 * Validate order amount (minimum order: ₦100, maximum: ₦10,000,000)
 */
export function isValidOrderAmount(amount: number): boolean {
    return isValidAmount(amount, 100, 10000000);
}

/**
 * Sanitize string input (remove potential XSS)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';

    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 5): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size > 0 && size <= maxBytes;
}

/**
 * Validate file type by extension
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Validate image file
 */
export function isValidImage(filename: string, size: number): {
    valid: boolean;
    error?: string;
} {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!isValidFileType(filename, allowedTypes)) {
        return {
            valid: false,
            error: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF'
        };
    }

    if (!isValidFileSize(size, 10)) {
        return {
            valid: false,
            error: 'File too large. Maximum size: 10MB'
        };
    }

    return { valid: true };
}

/**
 * Validate wallet address (basic check)
 */
export function isValidWalletAddress(address: string): boolean {
    // Basic validation - adjust based on your wallet format
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate phone number (Nigerian format)
 */
export function isValidPhoneNumber(phone: string): boolean {
    // Nigerian phone format validation
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Comprehensive order validation
 */
export interface OrderValidation {
    valid: boolean;
    errors: string[];
}

export function validateOrder(data: {
    userId: string;
    items: any[];
    totalAmount: number;
    shippingMethod?: string;
}): OrderValidation {
    const errors: string[] = [];

    if (!data.userId || typeof data.userId !== 'string') {
        errors.push('Invalid user ID');
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Cart is empty');
    }

    if (data.items && data.items.length > 50) {
        errors.push('Too many items in cart (max 50)');
    }

    if (!isValidOrderAmount(data.totalAmount)) {
        errors.push('Invalid order amount (min: ₦100, max: ₦10,000,000)');
    }

    // Validate each item
    data.items?.forEach((item, index) => {
        if (!item.id) {
            errors.push(`Item ${index + 1}: Missing product ID`);
        }
        if (!isValidQuantity(item.quantity)) {
            errors.push(`Item ${index + 1}: Invalid quantity`);
        }
        if (!isValidAmount(item.price, 1)) {
            errors.push(`Item ${index + 1}: Invalid price`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate product data
 */
export function validateProduct(data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    category?: string;
}): OrderValidation {
    const errors: string[] = [];

    const sanitizedName = sanitizeString(data.name, 200);
    if (!sanitizedName || sanitizedName.length < 3) {
        errors.push('Product name must be at least 3 characters');
    }

    const sanitizedDescription = sanitizeString(data.description, 2000);
    if (!sanitizedDescription || sanitizedDescription.length < 10) {
        errors.push('Description must be at least 10 characters');
    }

    if (!isValidAmount(data.price, 1, 10000000)) {
        errors.push('Invalid price (min: ₦1, max: ₦10,000,000)');
    }

    if (!isValidQuantity(data.quantity)) {
        errors.push('Invalid quantity');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
