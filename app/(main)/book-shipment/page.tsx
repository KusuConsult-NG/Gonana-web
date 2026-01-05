"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Truck, MapPin, Package } from "lucide-react";
import { useState } from "react";

export default function BookShipmentPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-display text-text-light dark:text-text-dark">Book a Shipment</h1>
                <p className="text-secondary-text-light dark:text-secondary-text-dark mt-2">
                    Schedule a pickup or delivery for your agricultural produce.
                </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-8 text-center">
                <p className="text-lg font-medium mb-4">This feature is currently under maintenance.</p>
                <p className="text-secondary-text-light dark:text-secondary-text-dark mb-6">
                    We are integrating with top logistics partners to bring you the best rates. Please check back soon or contact support for manual booking.
                </p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        </div>
    );
}
