/**
 * Password Strength Indicator Component
 * Shows visual feedback for password strength
 */

'use client';

import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/passwordValidation';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    if (!password) return null;

    const validation = validatePassword(password);
    const colorClass = getPasswordStrengthColor(validation.strength);
    const strengthText = getPasswordStrengthText(validation.strength);

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded ${validation.score >= 25 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded ${validation.score >= 50 ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded ${validation.score >= 75 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded ${validation.score >= 90 ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            </div>

            {/* Strength Text */}
            <p className={`text-xs font-medium ${colorClass}`}>
                {strengthText}
            </p>

            {/* Error Messages */}
            {validation.errors.length > 0 && (
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    {validation.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{error}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Success Message */}
            {validation.isValid && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Password meets all requirements
                </p>
            )}
        </div>
    );
}
