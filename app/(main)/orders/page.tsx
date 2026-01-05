'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, MapPin, Calendar, TruckIcon, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    trackingNumber?: string;
    orderStatus: string;
    estimatedDelivery?: string;
    createdAt: string;
    items: any[];
    totalAmount: number;
    currency: string;
}

export default function MyOrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
        }
    }, [session]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders/my-orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'CANCELLED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'SHIPPED':
            case 'IN_TRANSIT':
                return <TruckIcon className="w-5 h-5 text-purple-600" />;
            default:
                return <Package className="w-5 h-5 text-blue-600" />;
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
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        My Orders
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and track all your orders
                    </p>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No orders yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start shopping to see your orders here
                        </p>
                        <Link
                            href="/marketplace"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {getStatusIcon(order.orderStatus)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Order #{order.id.slice(-8)}
                                            </h3>
                                            {order.trackingNumber && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Tracking: {order.trackingNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Ordered: {formatDate(order.createdAt)}
                                    </div>
                                    {order.estimatedDelivery && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <TruckIcon className="w-4 h-4 mr-2" />
                                            Est. Delivery: {formatDate(order.estimatedDelivery)}
                                        </div>
                                    )}
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {order.currency} {order.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {order.trackingNumber && (
                                        <Link
                                            href={`/track?number=${order.trackingNumber}`}
                                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                        >
                                            Track Order →
                                        </Link>
                                    )}
                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
