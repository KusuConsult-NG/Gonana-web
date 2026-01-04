
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
    id: number;
    name: string;
    seller: string;
    unit: string;
    price: number;
    quantity: number;
    image: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    clearCart: () => void;
    subtotal: number;
    totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        } else {
            // Initialize with mock data for demo purposes if empty
            setItems([
                { id: 1, name: "Organic Cassava Tubers", seller: "GreenFields Co-op", unit: "50kg Sack", price: 12500, quantity: 2, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200" },
                { id: 2, name: "Premium Dried Cocoa Beans", seller: "Ondo Farmers Union", unit: "1kg Bag", price: 4200, quantity: 5, image: "https://images.unsplash.com/photo-1627807455855-6b6534571060?auto=format&fit=crop&q=80&w=200" }
            ]);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === newItem.id);
            if (existing) {
                return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i);
            }
            return [...prev, newItem];
        });
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setItems(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const clearCart = () => setItems([]);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
