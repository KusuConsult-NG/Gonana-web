import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "product" | "feed" | "notification";
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", hover = false, children, ...props }, ref) => {
        const baseStyles =
            "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark transition-all duration-200";

        const variants = {
            default: "rounded-xl shadow-sm",
            product: "rounded-xl shadow-sm hover:shadow-xl overflow-hidden",
            feed: "rounded-xl shadow-sm",
            notification: "rounded-xl shadow-sm",
        };

        const hoverStyles = hover
            ? "hover:shadow-lg hover:border-primary/50 cursor-pointer"
            : "";

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], hoverStyles, className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("p-6 pb-4", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-display font-bold text-text-light dark:text-text-dark",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
