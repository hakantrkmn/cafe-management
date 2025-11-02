import {
  ExtraWithQuantity,
  MenuItemSize,
  MenuItemWithRelations,
  OrderCartItem,
  OrderOperations,
  OrderProduct,
} from "@/types";

/**
 * Centralized order calculation utilities
 * Handles all price calculations, product management, and order logic
 */
export class OrderCalculator {
  /**
   * Calculate the base price of a menu item based on size
   */
  static calculateMenuItemPrice(
    menuItem: MenuItemWithRelations,
    size?: MenuItemSize
  ): number {
    if (!menuItem.hasSizes || !size || !menuItem.prices) {
      return menuItem.price;
    }

    const sizePrice = menuItem.prices.find((p) => p.size === size);
    const finalPrice = sizePrice ? sizePrice.price : menuItem.price;

    return finalPrice;
  }

  /**
   * Calculate the total price of extras
   */
  static calculateExtrasTotal(extras: ExtraWithQuantity[]): number {
    return extras.reduce(
      (total, extra) => total + extra.price * extra.quantity,
      0
    );
  }

  /**
   * Calculate the subtotal for a cart item
   */
  static calculateCartItemSubtotal(
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[] = [],
    size?: MenuItemSize
  ): number {
    const basePrice = this.calculateMenuItemPrice(menuItem, size);
    const extrasTotal = this.calculateExtrasTotal(extras);
    return (basePrice + extrasTotal) * quantity;
  }

  /**
   * Calculate the total price of all cart items
   */
  static calculateCartTotal(cartItems: OrderCartItem[]): number {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Create a cart item from menu item data
   */
  static createCartItem(
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[] = [],
    size?: MenuItemSize
  ): OrderCartItem {
    const basePrice = this.calculateMenuItemPrice(menuItem, size);
    const extrasTotal = this.calculateExtrasTotal(extras);
    const subtotal = (basePrice + extrasTotal) * quantity;

    return {
      id: `${Date.now()}-${Math.random()}`,
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      menuItemPrice: basePrice, // Base price only (extras are calculated separately)
      quantity,
      size,
      extras: extras.map((extra) => ({
        extraId: extra.id,
        extraName: extra.name,
        extraPrice: extra.price,
        quantity: extra.quantity,
      })),
      subtotal, // This includes base price + extras total
    };
  }

  /**
   * Create a cart item for an extra (treating it like a separate product)
   */
  static createExtraCartItem(
    extra: ExtraWithQuantity,
    quantity: number = 1
  ): OrderCartItem {
    const subtotal = extra.price * quantity;

    return {
      id: `${Date.now()}-${Math.random()}-extra`,
      menuItemId: extra.id,
      menuItemName: extra.name,
      menuItemPrice: extra.price,
      quantity,
      size: undefined,
      extras: [],
      subtotal,
    };
  }

  /**
   * Update cart item quantity and recalculate subtotal
   */
  static updateCartItemQuantity(
    cartItem: OrderCartItem,
    newQuantity: number
  ): OrderCartItem | null {
    if (newQuantity <= 0) {
      return null; // Remove item
    }

    const basePrice = cartItem.menuItemPrice;
    const extrasTotal = cartItem.extras.reduce(
      (sum, extra) => sum + extra.extraPrice * extra.quantity,
      0
    );
    const subtotal = (basePrice + extrasTotal) * newQuantity;

    return {
      ...cartItem,
      quantity: newQuantity,
      subtotal,
    };
  }

  /**
   * Create OrderProduct from cart item for database storage
   */
  static createOrderProductFromCartItem(cartItem: OrderCartItem): OrderProduct {
    const extrasTotal = cartItem.extras.reduce(
      (sum, extra) => sum + extra.extraPrice * extra.quantity,
      0
    );
    const totalPrice = cartItem.menuItemPrice + extrasTotal;

    return {
      id: cartItem.menuItemId,
      isPaid: false,
      price: totalPrice,
      size: cartItem.size,
      extras: cartItem.extras.map((extra) => ({
        id: extra.extraId,
        name: extra.extraName,
        price: extra.extraPrice,
      })),
    };
  }

  /**
   * Create multiple OrderProducts from cart items
   */
  static createOrderProductsFromCartItems(
    cartItems: OrderCartItem[]
  ): OrderProduct[] {
    return cartItems.map((cartItem) =>
      this.createOrderProductFromCartItem(cartItem)
    );
  }

  /**
   * Calculate total amount for an order
   */
  static calculateOrderTotal(products: OrderProduct[]): number {
    return products.reduce((total, product) => total + product.price, 0);
  }

  /**
   * Calculate paid amount for an order
   */
  static calculatePaidAmount(products: OrderProduct[]): number {
    return products
      .filter((product) => product.isPaid)
      .reduce((total, product) => total + product.price, 0);
  }

  /**
   * Calculate remaining amount for an order
   */
  static calculateRemainingAmount(products: OrderProduct[]): number {
    return (
      this.calculateOrderTotal(products) - this.calculatePaidAmount(products)
    );
  }

  /**
   * Check if all products in an order are paid
   */
  static areAllProductsPaid(products: OrderProduct[]): boolean {
    return products.length > 0 && products.every((product) => product.isPaid);
  }

  /**
   * Get paid products count
   */
  static getPaidProductsCount(products: OrderProduct[]): number {
    return products.filter((product) => product.isPaid).length;
  }

  /**
   * Get unpaid products count
   */
  static getUnpaidProductsCount(products: OrderProduct[]): number {
    return products.filter((product) => !product.isPaid).length;
  }

  /**
   * Mark a specific product as paid
   */
  static markProductAsPaid(
    products: OrderProduct[],
    productIndex: number
  ): OrderProduct[] {
    if (productIndex < 0 || productIndex >= products.length) {
      return products;
    }

    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      isPaid: true,
    };

    return updatedProducts;
  }

  /**
   * Mark all products as paid
   */
  static markAllProductsAsPaid(products: OrderProduct[]): OrderProduct[] {
    return products.map((product) => ({
      ...product,
      isPaid: true,
    }));
  }

  /**
   * Remove a product from the products array
   */
  static removeProduct(
    products: OrderProduct[],
    productIndex: number
  ): OrderProduct[] {
    if (productIndex < 0 || productIndex >= products.length) {
      return products;
    }

    const updatedProducts = [...products];
    updatedProducts.splice(productIndex, 1);
    return updatedProducts;
  }

  /**
   * Add products to existing products array
   */
  static addProductsToExisting(
    existingProducts: OrderProduct[],
    newProducts: OrderProduct[]
  ): OrderProduct[] {
    return [...existingProducts, ...newProducts];
  }

  /**
   * Get order status based on products
   */
  static getOrderStatus(products: OrderProduct[]): {
    isPaid: boolean;
    paidAmount: number;
    totalAmount: number;
    remainingAmount: number;
    paidProductsCount: number;
    unpaidProductsCount: number;
  } {
    const totalAmount = this.calculateOrderTotal(products);
    const paidAmount = this.calculatePaidAmount(products);
    const remainingAmount = totalAmount - paidAmount;
    const paidProductsCount = this.getPaidProductsCount(products);
    const unpaidProductsCount = this.getUnpaidProductsCount(products);
    const isPaid = this.areAllProductsPaid(products);

    return {
      isPaid,
      paidAmount,
      totalAmount,
      remainingAmount,
      paidProductsCount,
      unpaidProductsCount,
    };
  }

  /**
   * Validate cart item data
   */
  static validateCartItem(cartItem: OrderCartItem): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!cartItem.menuItemId) {
      errors.push("Menu item ID is required");
    }

    if (!cartItem.menuItemName) {
      errors.push("Menu item name is required");
    }

    if (cartItem.quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (cartItem.menuItemPrice < 0) {
      errors.push("Menu item price cannot be negative");
    }

    if (cartItem.subtotal < 0) {
      errors.push("Subtotal cannot be negative");
    }

    // Validate extras (optional)
    if (cartItem.extras && Array.isArray(cartItem.extras)) {
      cartItem.extras.forEach((extra, index) => {
        if (!extra.extraId) {
          errors.push(`Extra ${index + 1} ID is required`);
        }
        if (!extra.extraName) {
          errors.push(`Extra ${index + 1} name is required`);
        }
        if (extra.quantity <= 0) {
          errors.push(`Extra ${index + 1} quantity must be greater than 0`);
        }
        if (extra.extraPrice < 0) {
          errors.push(`Extra ${index + 1} price cannot be negative`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order product data
   */
  static validateOrderProduct(product: OrderProduct): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!product.id) {
      errors.push("Product ID is required");
    }

    if (product.price < 0) {
      errors.push("Product price cannot be negative");
    }

    if (typeof product.isPaid !== "boolean") {
      errors.push("Product payment status must be a boolean");
    }

    // Validate extras if present
    if (product.extras) {
      product.extras.forEach((extra, index) => {
        if (!extra.id) {
          errors.push(`Extra ${index + 1} ID is required`);
        }
        if (extra.price < 0) {
          errors.push(`Extra ${index + 1} price cannot be negative`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Direct save functionality - saves cart item immediately without confirmation
   * This function handles the complete flow from cart item to database save
   */
  static async saveCartItemDirectly(
    cartItem: OrderCartItem,
    tableId: string,
    cafeId: string,
    orderOperations: OrderOperations
  ): Promise<void> {
    // Validate cart item before saving
    const validation = this.validateCartItem(cartItem);
    if (!validation.isValid) {
      throw new Error(`Invalid cart item: ${validation.errors.join(", ")}`);
    }

    try {
      // Check if there are existing unpaid orders for this table
      const existingOrders = orderOperations.getTableOrders(tableId);

      if (existingOrders.length > 0) {
        // Add to existing order
        await orderOperations.addToExistingOrder(existingOrders[0].id, [
          cartItem,
        ]);
      } else {
        // Create new order
        await orderOperations.saveOrder(tableId, [cartItem]);
      }
    } catch (error: unknown) {
      // If API returns "unpaid order exists" error, try adding to existing order
      if (
        error instanceof Error &&
        error.message?.includes("ödenmemiş sipariş var")
      ) {
        const existingOrders = orderOperations.getTableOrders(tableId);
        if (existingOrders.length > 0) {
          await orderOperations.addToExistingOrder(existingOrders[0].id, [
            cartItem,
          ]);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Create and save cart item directly from menu item data
   * This is the main function to use for direct saving
   */
  static async createAndSaveCartItem(
    menuItem: MenuItemWithRelations,
    quantity: number,
    extras: ExtraWithQuantity[] = [],
    size: MenuItemSize | undefined,
    tableId: string,
    cafeId: string,
    orderOperations: OrderOperations
  ): Promise<void> {
    // Create cart item using centralized calculator
    const cartItem = this.createCartItem(menuItem, quantity, extras, size);

    // Save directly
    await this.saveCartItemDirectly(cartItem, tableId, cafeId, orderOperations);
  }
}
