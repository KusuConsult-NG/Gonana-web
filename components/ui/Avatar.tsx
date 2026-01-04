import { HTMLAttributes, forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
    status?: "online" | "offline" | "away" | "busy";
    verified?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    (
        {
            className,
            src,
            alt,
            fallback,
            size = "md",
            status,
            verified,
            ...props
        },
        ref
    ) => {
        const sizes = {
            sm: "h-8 w-8 text-xs",
            md: "h-10 w-10 text-sm",
            lg: "h-12 w-12 text-base",
            xl: "h-16 w-16 text-lg",
        };

        const statusColors = {
            online: "bg-green-500",
            offline: "bg-gray-400",
            away: "bg-yellow-500",
            busy: "bg-red-500",
        };

        const getInitials = (name?: string) => {
            if (!name) return "?";
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <div ref={ref} className={`relative ${className}`} {...props}>
                <div
                    className={cn(
                        "rounded-full flex items-center justify-center overflow-hidden",
                        "border-2 border-border-light dark:border-border-dark",
                        "bg-gray-200 dark:bg-gray-700",
                        sizes[size]
                    )}
                >
                    {src ? (
                        <Image
                            src={src}
                            alt={alt || "Avatar"}
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <span className="font-medium text-text-light dark:text-text-dark">
                            {getInitials(fallback || alt)}
                        </span>
                    )}
                </div>
                {status && (
                    <span
                        className={cn(
                            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800",
                            statusColors[status]
                        )}
                    />
                )}
                {verified && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-blue-500 rounded-full text-white text-xs">
                        ✓
                    </span>
                )}
            </div>
        );
    }
);

Avatar.displayName = "Avatar";

export { Avatar };
