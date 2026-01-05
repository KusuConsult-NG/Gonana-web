"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Info, AlertTriangle, Truck, MapPin, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PriceTag } from "@/components/ui/PriceTag";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export default function SellPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        quantity: "",
        unit: "kg",
        category: PRODUCT_CATEGORIES[0].id,
        location: "",
        selfShipment: false,
        agreeToTerms: false
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Limit to 3 images total
        const remainingSlots = 3 - images.length;
        const newFiles = acceptedFiles.slice(0, remainingSlots);

        if (newFiles.length > 0) {
            setImages(prev => [...prev, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    }, [images]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        disabled: images.length >= 3
    });

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            // Revoke URL to prevent memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agreeToTerms) {
            alert("Please accept the terms and conditions.");
            return;
        }

        if (images.length === 0) {
            alert("Please upload at least one image of your product.");
            return;
        }

        setIsLoading(true);

        try {
            // Mock image upload - in real app, upload to S3/Cloudinary here
            // For now, allow the blob URLs (though they won't persist well across sessions) 
            // OR use placeholders. Let's use placeholders for stability.
            const imageUrls = images.map((_, i) => `https://via.placeholder.com/400?text=Product+${i + 1}`);

            const payload = {
                name: formData.title,
                description: formData.description,
                price: formData.price,
                quantity: formData.quantity,
                unit: formData.unit,
                location: formData.location,
                category: formData.category,
                deliveryMode: formData.selfShipment ? "self" : "logistics",
                images: imageUrls
            };

            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/?success=product-created");
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to create product"}`);
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate commission
    const price = parseFloat(formData.price) || 0;
    const commission = price * 0.05;
    const earnings = price - commission;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-text-light dark:text-text-dark">List a Product</h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark mt-2">
                    Share your harvest with thousands of buyers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 space-y-6">

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                Product Images <span className="text-secondary-text-light dark:text-secondary-text-dark text-xs font-normal">(Max 3)</span>
                            </label>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border-light dark:border-border-dark group">
                                        <Image
                                            src={preview}
                                            alt={`Product ${index + 1}`}
                                            className="object-cover"
                                            fill
                                            sizes="200px"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {images.length < 3 && (
                                    <div
                                        {...getRootProps()}
                                        className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive
                                            ? "border-primary bg-primary/5"
                                            : "border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <input {...getInputProps()} />
                                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-secondary-text-light dark:text-secondary-text-dark text-center px-2">
                                            {isDragActive ? "Drop here" : "Upload Photo"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <Input
                                label="Product Title"
                                placeholder="e.g. Fresh Organic Tomatoes"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                leftIcon={<FileText className="h-4 w-4" />}
                                required
                            />

                            <Input
                                label="Available Quantity"
                                type="number"
                                placeholder="e.g. 100"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm resize-none"
                                    placeholder="Describe your product's quality, harvest date, variety, etc."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                                    Category
                                </label>
                                <select
                                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {PRODUCT_CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label="Price (NGN)"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    leftIcon={<span className="text-gray-500 font-bold">₦</span>}
                                    required
                                />
                                <div className="absolute top-0 right-0">
                                    <select
                                        className="h-[42px] mt-[26px] rounded-r-lg border-l-0 border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-screen"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="kg">per kg</option>
                                        <option value="bag">per bag</option>
                                        <option value="basket">per basket</option>
                                        <option value="ton">per ton</option>
                                        <option value="unit">per unit</option>
                                    </select>
                                </div>
                                <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1 flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Platform fee: <span className="text-red-500 font-medium">5%</span>
                                </p>
                            </div>

                            <Input
                                label="Location"
                                placeholder="e.g. Kaduna, Nigeria"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                leftIcon={<MapPin className="h-4 w-4" />}
                                required
                            />
                        </div>

                        {/* Shipping */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                    <Truck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-text-light dark:text-text-dark text-sm">Self-Shipment</h4>
                                    <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark">
                                        I will handle delivery myself
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.selfShipment}
                                    onChange={(e) => setFormData({ ...formData, selfShipment: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {/* Terms */}
                        <div className="pt-4 border-t border-border-light dark:border-border-dark">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    checked={formData.agreeToTerms}
                                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                />
                                <span className="text-sm text-secondary-text-light dark:text-secondary-text-dark group-hover:text-text-light dark:group-hover:text-text-dark transition-colors">
                                    I confirm that this product meets Gonana's quality standards and I agree to the <Link href="/terms" className="text-primary hover:underline">Seller Terms of Service</Link>.
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            disabled={!formData.agreeToTerms || !formData.title || !formData.price}
                        >
                            List Product
                        </Button>

                    </form>
                </div>

                {/* Sidebar Preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* Earnings Preview */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                            <h3 className="font-bold text-text-light dark:text-text-dark mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Estimated Earnings
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary-text-light dark:text-secondary-text-dark">Listing Price</span>
                                    <span className="font-medium text-text-light dark:text-text-dark"><PriceTag amount={price} currency="NGN" /></span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary-text-light dark:text-secondary-text-dark">Commission (5%)</span>
                                    <span className="font-medium text-red-500">- <PriceTag amount={commission} currency="NGN" /></span>
                                </div>
                                <div className="border-t border-border-light dark:border-border-dark pt-3 flex justify-between font-bold">
                                    <span className="text-text-light dark:text-text-dark">You Receive</span>
                                    <span className="text-green-600 dark:text-green-500"><PriceTag amount={earnings} currency="NGN" /></span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Funds are released to your wallet 24h after successful delivery.
                                </p>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                            <h4 className="font-bold text-sm mb-2">Seller Guidelines</h4>
                            <ul className="text-sm text-secondary-text-light space-y-2 list-disc pl-4">
                                <li>Use clear, bright photos</li>
                                <li>Be honest about quality</li>
                                <li>Ship within 24 hours</li>
                                <li>Respond to chats promptly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
