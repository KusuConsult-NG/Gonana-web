
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";

async function getOrder(id: string) {
    try {
        const orderDoc = await adminDb.collection('orders').doc(id).get();
        if (!orderDoc.exists) {
            return null;
        }
        return { id: orderDoc.id, ...orderDoc.data() };
    } catch (error) {
        return null;
    }
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id) as any;

    if (!order) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Your order <span className="font-mono font-bold text-gray-700 dark:text-gray-300">#{order.id.slice(-6).toUpperCase()}</span> has been successfully placed.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
                    <div className="space-y-3">
                        {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-start text-sm">
                                <span className="text-gray-800 dark:text-gray-200">
                                    {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">₦{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between font-bold text-base">
                            <span className="text-gray-900 dark:text-white">Total Paid</span>
                            <span className="text-primary">₦{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link href="/" className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors">
                        <Home className="mr-2 h-4 w-4" /> Return Home
                    </Link>
                    <Link href="/orders" className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Package className="mr-2 h-4 w-4" /> View My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
