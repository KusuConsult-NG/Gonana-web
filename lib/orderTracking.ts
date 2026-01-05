/**
 * Order Tracking Utility
 * Generates tracking numbers and manages order status tracking
 */

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';

export interface TrackingEvent {
    status: OrderStatus;
    location?: string;
    description: string;
    timestamp: string;
}

export interface TrackingInfo {
    trackingNumber: string;
    carrier?: string;
    currentStatus: OrderStatus;
    estimatedDelivery?: string;
    events: TrackingEvent[];
}

/**
 * Generate a unique tracking number
 * Format: GON-YYYYMMDD-XXXXX
 * Example: GON-20260105-A1B2C
 */
export function generateTrackingNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Generate random alphanumeric code (5 characters)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 5; i++) {
        randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return `GON-${year}${month}${day}-${randomCode}`;
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
        'PENDING': 'Pending Payment',
        'CONFIRMED': 'Order Confirmed',
        'PROCESSING': 'Processing',
        'SHIPPED': 'Shipped',
        'IN_TRANSIT': 'In Transit',
        'OUT_FOR_DELIVERY': 'Out for Delivery',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'REFUNDED': 'Refunded'
    };

    return statusMap[status] || status;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'PROCESSING': 'bg-blue-100 text-blue-800',
        'SHIPPED': 'bg-purple-100 text-purple-800',
        'IN_TRANSIT': 'bg-purple-100 text-purple-800',
        'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'REFUNDED': 'bg-gray-100 text-gray-800'
    };

    return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate estimated delivery date
 * @param shippingMethod - 'logistics' or 'pickup'
 * @returns ISO date string
 */
export function calculateEstimatedDelivery(shippingMethod: string): string {
    const now = new Date();
    let daysToAdd = 3; // Default: 3 days

    if (shippingMethod === 'pickup') {
        daysToAdd = 1; // Next day for pickup
    } else if (shippingMethod === 'express') {
        daysToAdd = 1;
    } else if (shippingMethod === 'standard') {
        daysToAdd = 5;
    }

    const estimatedDate = new Date(now);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

    return estimatedDate.toISOString();
}

/**
 * Create initial tracking event
 */
export function createInitialTrackingEvent(orderStatus: OrderStatus = 'CONFIRMED'): TrackingEvent {
    return {
        status: orderStatus,
        location: 'Lagos, Nigeria',
        description: 'Order has been confirmed and is being processed',
        timestamp: new Date().toISOString()
    };
}

/**
 * Format date for display
 */
export function formatTrackingDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Check if order is in final state
 */
export function isOrderFinal(status: OrderStatus): boolean {
    return ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status);
}

/**
 * Get next possible statuses for update
 */
export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
        'PENDING': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['PROCESSING', 'CANCELLED'],
        'PROCESSING': ['SHIPPED', 'CANCELLED'],
        'SHIPPED': ['IN_TRANSIT', 'CANCELLED'],
        'IN_TRANSIT': ['OUT_FOR_DELIVERY', 'DELIVERED'],
        'OUT_FOR_DELIVERY': ['DELIVERED'],
        'DELIVERED': ['REFUNDED'],
        'CANCELLED': [],
        'REFUNDED': []
    };

    return statusFlow[currentStatus] || [];
}
