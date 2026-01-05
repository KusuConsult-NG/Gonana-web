"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Package, MapPin, Phone, User, Truck, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BookShipmentPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Pickup Details
        pickupName: "",
        pickupPhone: "",
        pickupAddress: "",
        pickupCity: "",
        pickupState: "",

        // Delivery Details
        deliveryName: "",
        deliveryPhone: "",
        deliveryAddress: "",
        deliveryCity: "",
        deliveryState: "",

        // Package Details
        packageType: "produce",
        weight: "",
        quantity: "",
        description: "",
        value: "",

        // Shipping Options
        shippingSpeed: "standard",
        deliveryDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            alert("Please login to book a shipment");
            router.push("/login?callbackUrl=/book-shipment");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/logistics/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    userId: session.user.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Shipment booked successfully! Tracking ID: ${data.trackingId}`);
                router.push("/logistics");
            } else {
                const error = await response.json();
                alert(`Failed to book shipment: ${error.error}`);
            }
        } catch (error) {
            console.error("Shipment booking error:", error);
            alert("Failed to book shipment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display text-text-light dark:text-text-dark">
                    Book a Shipment
                </h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark mt-2">
                    Ship your agricultural products with our trusted logistics partners.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Pickup Information */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                            Pickup Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Contact Name"
                            placeholder="John Doe"
                            value={formData.pickupName}
                            onChange={(e) => setFormData({ ...formData, pickupName: e.target.value })}
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={formData.pickupPhone}
                            onChange={(e) => setFormData({ ...formData, pickupPhone: e.target.value })}
                            leftIcon={<Phone className="h-4 w-4" />}
                            required
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Pickup Address"
                                placeholder="123 Farm Road"
                                value={formData.pickupAddress}
                                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                                leftIcon={<MapPin className="h-4 w-4" />}
                                required
                            />
                        </div>
                        <Input
                            label="City"
                            placeholder="Lagos"
                            value={formData.pickupCity}
                            onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                            required
                        />
                        <Input
                            label="State"
                            placeholder="Lagos State"
                            value={formData.pickupState}
                            onChange={(e) => setFormData({ ...formData, pickupState: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                            Delivery Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Recipient Name"
                            placeholder="Jane Smith"
                            value={formData.deliveryName}
                            onChange={(e) => setFormData({ ...formData, deliveryName: e.target.value })}
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={formData.deliveryPhone}
                            onChange={(e) => setFormData({ ...formData, deliveryPhone: e.target.value })}
                            leftIcon={<Phone className="h-4 w-4" />}
                            required
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Delivery Address"
                                placeholder="456 Market Street"
                                value={formData.deliveryAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                leftIcon={<MapPin className="h-4 w-4" />}
                                required
                            />
                        </div>
                        <Input
                            label="City"
                            placeholder="Abuja"
                            value={formData.deliveryCity}
                            onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                            required
                        />
                        <Input
                            label="State"
                            placeholder="FCT"
                            value={formData.deliveryState}
                            onChange={(e) => setFormData({ ...formData, deliveryState: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Package Details */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                            Package Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                Package Type
                            </label>
                            <select
                                value={formData.packageType}
                                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                                required
                            >
                                <option value="produce">Fresh Produce</option>
                                <option value="grains">Grains & Seeds</option>
                                <option value="livestock">Livestock Products</option>
                                <option value="equipment">Farm Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Weight (kg)"
                            type="number"
                            placeholder="0"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            min="0"
                            step="0.1"
                            required
                        />

                        <Input
                            label="Quantity (Units/Bags)"
                            type="number"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            min="1"
                            required
                        />

                        <Input
                            label="Declared Value (NGN)"
                            type="number"
                            placeholder="0"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            min="0"
                            required
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the package contents..."
                                rows={3}
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm resize-none"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping Options */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                            Shipping Options
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-3">
                                Delivery Speed
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-4 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="speed"
                                            value="standard"
                                            checked={formData.shippingSpeed === "standard"}
                                            onChange={(e) => setFormData({ ...formData, shippingSpeed: e.target.value })}
                                            className="h-4 w-4 text-primary"
                                        />
                                        <div>
                                            <p className="font-medium text-text-light dark:text-text-dark">
                                                Standard (3-5 days)
                                            </p>
                                            <p className="text-xs text-gray-500">Most economical option</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-primary">₦2,500</span>
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-lg border border-border-light dark:border-border-dark cursor-pointer hover:border-primary transition-colors">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="speed"
                                            value="express"
                                            checked={formData.shippingSpeed === "express"}
                                            onChange={(e) => setFormData({ ...formData, shippingSpeed: e.target.value })}
                                            className="h-4 w-4 text-primary"
                                        />
                                        <div>
                                            <p className="font-medium text-text-light dark:text-text-dark">
                                                Express (1-2 days)
                                            </p>
                                            <p className="text-xs text-gray-500">Faster delivery</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-text-light dark:text-text-dark">₦4,500</span>
                                </label>
                            </div>
                        </div>

                        <Input
                            label="Preferred Pickup Date"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            leftIcon={<Calendar className="h-4 w-4" />}
                        />
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <Link href="/logistics" className="flex-1">
                        <Button type="button" variant="outline" size="lg" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        disabled={isLoading}
                        isLoading={isLoading}
                    >
                        {isLoading ? "Booking..." : (
                            <>
                                Book Shipment
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
