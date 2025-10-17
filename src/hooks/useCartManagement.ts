"use client";

import { ExtraWithQuantity, MenuItem, OrderCartItem } from "@/types";
import { useCallback, useState } from "react";

interface UseCartManagementReturn {
  cartItems: OrderCartItem[];
  cartTotal: number;
  addToCart: (
    menuItem: MenuItem,
    quantity: number,
    extras: ExtraWithQuantity[]
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export function useCartManagement(): UseCartManagementReturn {
  const [cartItems, setCartItems] = useState<OrderCartItem[]>([]);

  // Add item to cart
  const addToCart = useCallback(
    (
      menuItem: MenuItem,
      quantity: number,
      extras: ExtraWithQuantity[] = []
    ) => {
      const cartItem: OrderCartItem = {
        id: `${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        menuItemPrice: menuItem.price,
        quantity,
        extras: extras.map((extra) => ({
          extraId: extra.id,
          extraName: extra.name,
          extraPrice: extra.price,
          quantity: extra.quantity,
        })),
        subtotal:
          (menuItem.price +
            extras.reduce(
              (sum, extra) => sum + extra.price * extra.quantity,
              0
            )) *
          quantity,
      };

      setCartItems((prev) => [...prev, cartItem]);
    },
    []
  );

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Update cart item quantity
  const updateCartItemQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const basePrice = item.menuItemPrice;
            const extrasTotal = item.extras.reduce(
              (sum, extra) => sum + extra.extraPrice * extra.quantity,
              0
            );
            return {
              ...item,
              quantity,
              subtotal: (basePrice + extrasTotal) * quantity,
            };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  };
}
