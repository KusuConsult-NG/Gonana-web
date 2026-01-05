import { Truck, Shield, Clock, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LogisticsPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-text-light dark:text-text-dark mb-4">Gonana Logistics</h1>
                    <p className="text-lg text-secondary-text-light dark:text-secondary-text-dark max-w-3xl mx-auto">
                        Seamless delivery solutions connecting farmers and buyers across Nigeria
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Reliable Delivery</h3>
                        <p className="text-secondary-text-light dark:text-secondary-text-dark">
                            Partner logistics providers ensure your produce arrives fresh and on time.
                        </p>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Secure Handling</h3>
                        <p className="text-secondary-text-light dark:text-secondary-text-dark">
                            Specialized agricultural handling ensures your goods are protected during transit.
                        </p>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Track in Real-time</h3>
                        <p className="text-secondary-text-light dark:text-secondary-text-dark">
                            Monitor your shipment from farm to doorstep with live tracking updates.
                        </p>
                    </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
                        Seamless Integration
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">We&apos;ve partnered with Nigeria&apos;s leading logistics providers to ensure your produce reaches its destination fresh and on time. Compare rates, book pickups, and track deliveries directly from your dashboard.
                    </p>
                    <div className="flex gap-4 justify-center mt-8">
                        <Link href="/book-shipment" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                            Book a Shipment <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
                <div className="md:w-1/2 bg-gray-100 dark:bg-gray-800 relative min-h-[300px]">
                    <Image
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000"
                        alt="Logistics Fleet"
                        className="object-cover opacity-20 dark:opacity-10"
                        fill
                        sizes="100vw"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
