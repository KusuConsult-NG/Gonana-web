import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";

        const variants = {
            primary:
                "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md",
            secondary:
                "bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600",
            outline:
                "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            ghost:
                "text-primary hover:bg-primary/10 dark:hover:bg-primary/20",
            danger:
                "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
            md: "px-4 py-2 text-base rounded-lg gap-2",
            lg: "px-6 py-3 text-lg rounded-lg gap-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
