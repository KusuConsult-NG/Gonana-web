/**
 * Password Validation Utilities
 * Implements strong password requirements for enhanced security
 */

export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
    score: number; // 0-100
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else {
        score += 20;
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 15;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 15;
    }

    // Check for numbers
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 15;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)');
    } else {
        score += 15;
    }

    // Check for common patterns
    const commonPatterns = [
        /^password/i,
        /^123456/,
        /^qwerty/i,
        /^abc123/i,
        /(.)\1{2,}/ // Repeating characters
    ];

    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            errors.push('Password is too common or has repeating patterns');
            score -= 20;
            break;
        }
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong';
    if (score < 40) {
        strength = 'weak';
    } else if (score < 70) {
        strength = 'medium';
    } else {
        strength = 'strong';
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score: Math.max(0, Math.min(100, score))
    };
}

/**
 * Check if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword && password.length > 0;
}

/**
 * Generate password strength color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'text-red-500';
        case 'medium':
            return 'text-yellow-500';
        case 'strong':
            return 'text-green-500';
    }
}

/**
 * Get password strength text
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'Weak password';
        case 'medium':
            return 'Medium strength';
        case 'strong':
            return 'Strong password';
    }
}
