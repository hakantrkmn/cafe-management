"use client";

import { OrderCalculator } from "@/lib/orderCalculator";
import {
  ExtraWithQuantity,
  MenuItemSize,
  MenuItemWithRelations,
  OrderCartItem,
} from "@/types";
import { useCallback, useState } from "react";

interface UseCartManagementReturn {
  cartItems: OrderCartItem[];
  cartTotal: number;
  addToCart: (
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[],
    size?: MenuItemSize
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  validateCart: () => { isValid: boolean; errors: string[] };
}

export function useCartManagement(): UseCartManagementReturn {
  const [cartItems, setCartItems] = useState<OrderCartItem[]>([]);

  // Add item to cart using centralized calculator
  const addToCart = useCallback(
    (
      menuItem: MenuItemWithRelations,
      quantity: number,
      extras: ExtraWithQuantity[] = [],
      size?: MenuItemSize
    ) => {
      // Create separate cart items for each quantity of the menu item
      const newCartItems: OrderCartItem[] = [];

      for (let i = 0; i < quantity; i++) {
        // Create a cart item for each instance of the menu item
        const cartItem = OrderCalculator.createCartItem(
          menuItem,
          1, // Each cart item has quantity 1
          [], // Don't include extras in the menu item cart item
          size
        );
        newCartItems.push(cartItem);
      }

      // Create separate cart items for each extra instance
      extras.forEach((extra) => {
        for (let i = 0; i < extra.quantity; i++) {
          // Create a cart item for each extra instance using the new method
          const extraCartItem = OrderCalculator.createExtraCartItem(extra, 1);
          newCartItems.push(extraCartItem);
        }
      });

      setCartItems((prev) => [...prev, ...newCartItems]);
    },
    []
  );

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Update cart item quantity using centralized calculator
  const updateCartItemQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setCartItems(
        (prev) =>
          prev
            .map((item) => {
              if (item.id === itemId) {
                const updatedItem = OrderCalculator.updateCartItemQuantity(
                  item,
                  quantity
                );
                return updatedItem || item; // Return original item if null (should be removed)
              }
              return item;
            })
            .filter((item) => item !== null) // Remove null items
      );
    },
    []
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Validate entire cart
  const validateCart = useCallback(() => {
    const errors: string[] = [];

    cartItems.forEach((item, index) => {
      const validation = OrderCalculator.validateCartItem(item);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          errors.push(`Item ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [cartItems]);

  // Calculate cart total using centralized calculator
  const cartTotal = OrderCalculator.calculateCartTotal(cartItems);

  return {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    validateCart,
  };
}
