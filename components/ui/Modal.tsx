"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    title?: string;
    description?: string;
    showClose?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    children,
    size = "md",
    title,
    description,
    showClose = true,
}: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={cn(
                        "relative w-full transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-2xl transition-all",
                        "animate-enter",
                        sizes[size]
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showClose) && (
                        <div className="flex items-start justify-between p-6 pb-4 border-b border-border-light dark:border-border-dark">
                            <div>
                                {title && (
                                    <h3
                                        className="text-xl font-display font-bold text-text-light dark:text-text-dark"
                                        id="modal-title"
                                    >
                                        {title}
                                    </h3>
                                )}
                                {description && (
                                    <p className="mt-1 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {showClose && (
                                <button
                                    onClick={onClose}
                                    className="ml-4 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

// Export sub-components for flexibility
export function ModalHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("pb-4 border-b border-border-light dark:border-border-dark", className)}>
            {children}
        </div>
    );
}

export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("py-4", className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3", className)}>
            {children}
        </div>
    );
}
