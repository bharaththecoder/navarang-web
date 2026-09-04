'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, CutOption } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, weightKg: number, weightLabel: string, cut: CutOption, skin?: 'with-skin' | 'skinless') => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, weightKg: number, weightLabel: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  deliveryFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('navarang_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('navarang_cart', JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const addToCart = (
    product: Product,
    weightKg: number,
    weightLabel: string,
    cut: CutOption,
    skin?: 'with-skin' | 'skinless'
  ) => {
    const unitPrice = product.basePricePerKg + (cut.priceModifier || 0);
    const totalPrice = Math.round(unitPrice * weightKg);
    const cartItemId = `${product.id}-${cut.id}-${skin || 'default'}-${weightKg}`;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx > -1) {
        // Already in cart with exact same cut and weight
        return prev;
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          productName: product.name,
          category: product.category,
          weightKg,
          weightLabel,
          cut,
          skinPreference: skin,
          unitPrice,
          totalPrice,
          image: product.image,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, weightKg: number, weightLabel: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const totalPrice = Math.round(item.unitPrice * weightKg);
          return {
            ...item,
            weightKg,
            weightLabel,
            totalPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  // Free delivery for orders above ₹499 or in Madhuranagar
  const deliveryFee = cartTotal >= 499 || cartTotal === 0 ? 0 : 35;
  const grandTotal = cartTotal + deliveryFee;
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        deliveryFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
