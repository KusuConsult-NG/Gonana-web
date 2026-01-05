'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TrackingEvent {
    status: string;
    location?: string;
    description: string;
    timestamp: string;
}

interface TrackingInfo {
    trackingNumber: string;
    orderStatus: string;
    estimatedDelivery?: string;
    trackingEvents: TrackingEvent[];
    shippingMethod: string;
    createdAt: string;
}

export default function TrackOrderPage() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setLoading(true);
        setError('');
        setTrackingInfo(null);

        try {
            const response = await fetch(`/api/tracking/${trackingNumber.trim()}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Tracking number not found');
                return;
            }

            setTrackingInfo(data);
        } catch (err) {
            setError('Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'CONFIRMED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'PROCESSING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'SHIPPED': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            'IN_TRANSIT': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            'DELIVERED': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    };

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
                        <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Track Your Order
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your tracking number to see the latest status
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div>
                            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tracking Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="trackingNumber"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="GON-20260105-A1B2C"
                                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    required
                                />
                                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Format: GON-YYYYMMDD-XXXXX
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Tracking...
                                </>
                            ) : (
                                <>
                                    <Search className="-ml-1 mr-2 h-5 w-5" />
                                    Track Order
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
                        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Tracking Results */}
                {trackingInfo && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {trackingInfo.trackingNumber}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trackingInfo.orderStatus)}`}>
                                    {trackingInfo.orderStatus.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDate(trackingInfo.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Method</p>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {trackingInfo.shippingMethod}
                                </p>
                            </div>
                            {trackingInfo.estimatedDelivery && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(trackingInfo.estimatedDelivery)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Tracking History
                            </h3>
                            <div className="space-y-4">
                                {trackingInfo.trackingEvents.map((event, index) => (
                                    <div key={index} className="flex gap-4">
                                        {/* Timeline Dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            {index !== trackingInfo.trackingEvents.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                                            )}
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {event.status.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {event.description}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                            📍 {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(event.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/marketplace"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                    >
                        ← Back to Marketplace
                    </Link>
                </div>
            </div>
        </div>
    );
}
