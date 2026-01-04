"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Shield, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type DocumentType = "passport" | "national_id" | "drivers_license" | "";

export default function KYCPage() {
    const [step, setStep] = useState(1);
    const [documentType, setDocumentType] = useState<DocumentType>("");
    const [documentNumber, setDocumentNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);

    const onDropFront = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFrontImage(acceptedFiles[0]);
        }
    }, []);

    const onDropBack = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setBackImage(acceptedFiles[0]);
        }
    }, []);

    const frontDropzone = useDropzone({
        onDrop: onDropFront,
        accept: { "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const backDropzone = useDropzone({
        onDrop: onDropBack,
        accept: { "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Submit KYC documents
        alert("KYC documents submitted for review!");
    };

    const progressPercentage = (step / 3) * 100;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between">
                    <Link href="/" className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
                            Gonana
                        </h2>
                    </Link>

                    <nav className="hidden md:flex flex-1 justify-end gap-8 items-center">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Marketplace
                        </Link>
                        <Link href="/wallet" className="text-sm font-medium hover:text-primary transition-colors">
                            Wallet
                        </Link>
                        <Link href="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                            Community
                        </Link>
                        <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors">
                            Support
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center py-10 px-4 md:px-8">
                <div className="w-full max-w-[960px] space-y-8">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-6 justify-between items-end">
                            <p className="text-base font-semibold text-text-light dark:text-text-dark">
                                Step {step} of 3: Document Verification
                            </p>
                            <span className="text-text-muted-light dark:text-text-muted-dark text-sm">
                                {Math.round(progressPercentage)}% Completed
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
                            {step < 3 ? "Next: Review & Submit" : "Final Step"}
                        </p>
                    </div>

                    {/* Page Heading */}
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">
                            Verify your Identity
                        </h1>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-base max-w-2xl">
                            Please enter your document details and upload images to unlock wallet features,
                            higher withdrawal limits, and secure trading.
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Form Details */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-light dark:text-text-dark">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Document Details
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Document Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                            Document Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={documentType}
                                                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                                                className="appearance-none w-full rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark h-12 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                                required
                                            >
                                                <option value="">Select ID Type</option>
                                                <option value="passport">Passport</option>
                                                <option value="national_id">National ID Card</option>
                                                <option value="drivers_license">Driver's License</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-muted-light dark:text-text-muted-dark">
                                                <ChevronRight className="h-4 w-4 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Number */}
                                    <Input
                                        label="Document Number"
                                        type="text"
                                        placeholder="e.g. A12345678"
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                        required
                                    />

                                    {/* Expiry Date */}
                                    <Input
                                        label="Expiry Date"
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        required
                                    />
                                </form>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <Shield className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                                        Secure Encryption
                                    </p>
                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                                        Your documents are encrypted and stored securely. We only use them for
                                        identity verification purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Upload Zones */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm h-full flex flex-col">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-light dark:text-text-dark">
                                    <Upload className="h-5 w-5 text-primary" />
                                    Upload Images
                                </h3>

                                <div className="flex flex-col gap-4 flex-1">
                                    {/* Front Side Upload */}
                                    <div
                                        {...frontDropzone.getRootProps()}
                                        className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-all cursor-pointer flex-1 min-h-[160px] ${frontImage
                                                ? "border-primary bg-primary/5"
                                                : frontDropzone.isDragActive
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-surface-dark"
                                            }`}
                                    >
                                        <input {...frontDropzone.getInputProps()} />
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {frontImage ? (
                                                <Check className="h-6 w-6 text-primary" />
                                            ) : (
                                                <FileText className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <p className="font-medium text-center text-text-light dark:text-text-dark">
                                            {frontImage ? frontImage.name : "Front Side"}
                                        </p>
                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark text-center mt-1">
                                            {frontImage
                                                ? `${(frontImage.size / 1024).toFixed(2)} KB`
                                                : "Drag & drop or click to browse"}
                                        </p>
                                    </div>

                                    {/* Back Side Upload */}
                                    <div
                                        {...backDropzone.getRootProps()}
                                        className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-all cursor-pointer flex-1 min-h-[160px] ${backImage
                                                ? "border-primary bg-primary/5"
                                                : backDropzone.isDragActive
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-surface-dark"
                                            }`}
                                    >
                                        <input {...backDropzone.getInputProps()} />
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {backImage ? (
                                                <Check className="h-6 w-6 text-primary" />
                                            ) : (
                                                <FileText className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <p className="font-medium text-center text-text-light dark:text-text-dark">
                                            {backImage ? backImage.name : "Back Side"}
                                        </p>
                                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark text-center mt-1">
                                            {backImage
                                                ? `${(backImage.size / 1024).toFixed(2)} KB`
                                                : "Drag & drop or click to browse"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Supports JPG, PNG, PDF. Max 5MB per file.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 pb-12">
                        <Button variant="outline" size="lg" leftIcon={<ChevronLeft className="h-4 w-4" />}>
                            Back
                        </Button>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <Button variant="ghost" size="lg">
                                Save for Later
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                rightIcon={<ChevronRight className="h-4 w-4" />}
                                onClick={handleSubmit}
                                disabled={!documentType || !documentNumber || !expiryDate || !frontImage || !backImage}
                            >
                                Submit for Review
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
