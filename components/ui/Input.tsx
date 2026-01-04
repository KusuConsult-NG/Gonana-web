import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            label,
            error,
            leftIcon,
            rightIcon,
            helperText,
            disabled,
            ...props
        },
        ref
    ) => {
        const hasError = !!error;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "w-full rounded-lg border bg-white dark:bg-gray-800 text-text-light dark:text-text-dark placeholder-gray-400 transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            leftIcon ? "pl-10" : "pl-3",
                            rightIcon ? "pr-10" : "pr-3",
                            "py-2.5",
                            hasError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-border-light dark:border-border-dark",
                            className
                        )}
                        ref={ref}
                        disabled={disabled}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
