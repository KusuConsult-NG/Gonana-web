import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-secondary-text-light dark:text-secondary-text-dark animate-pulse">Loading Gonana Marketplace...</p>
        </div>
    );
}
