import { OrderCartItem, OrderProduct } from "@/types";

/**
 * Centralized order product management utilities
 * Handles all product add/remove operations with proper type safety
 */
export class OrderProductUtils {
  /**
   * Add products to an existing order
   */
  static addProductsToOrder(
    existingProducts: OrderProduct[],
    newProducts: OrderProduct[]
  ): OrderProduct[] {
    return [...existingProducts, ...newProducts];
  }

  /**
   * Remove a product from order by index and recalculate totals
   */
  static removeProductFromOrder(
    products: OrderProduct[],
    productIndex: number
  ): {
    updatedProducts: OrderProduct[];
    removedProduct: OrderProduct | null;
    newTotalAmount: number;
  } {
    if (productIndex < 0 || productIndex >= products.length) {
      return {
        updatedProducts: products,
        removedProduct: null,
        newTotalAmount: this.calculateOrderTotal(products),
      };
    }

    const updatedProducts = [...products];
    const removedProduct = updatedProducts.splice(productIndex, 1)[0];
    const newTotalAmount = this.calculateOrderTotal(updatedProducts);

    return {
      updatedProducts,
      removedProduct,
      newTotalAmount,
    };
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
   * Create OrderProduct from cart item for database storage
   */
  static createOrderProductFromCartItem(cartItem: OrderCartItem): OrderProduct {
    // For extras that are now separate cart items, they don't have extras array
    if (cartItem.extras.length === 0) {
      // This is either a menu item without extras or an extra treated as a separate product
      return {
        id: cartItem.menuItemId,
        isPaid: false,
        price: cartItem.menuItemPrice,
        size: cartItem.size,
        extras: [],
      };
    }

    // For menu items with bundled extras (legacy support)
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
   * Validate product operation
   */
  static validateProductOperation(
    products: OrderProduct[],
    productIndex: number,
    operation: "remove" | "markPaid"
  ): { isValid: boolean; error?: string } {
    if (productIndex < 0 || productIndex >= products.length) {
      return {
        isValid: false,
        error: "Invalid product index",
      };
    }

    const product = products[productIndex];

    if (operation === "markPaid" && product.isPaid) {
      return {
        isValid: false,
        error: "Product is already paid",
      };
    }

    return { isValid: true };
  }

  /**
   * Get products by payment status
   */
  static getProductsByPaymentStatus(
    products: OrderProduct[],
    isPaid: boolean
  ): OrderProduct[] {
    return products.filter((product) => product.isPaid === isPaid);
  }

  /**
   * Get order summary for display
   */
  static getOrderSummary(products: OrderProduct[]): {
    totalProducts: number;
    paidProducts: number;
    unpaidProducts: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    isFullyPaid: boolean;
  } {
    const totalProducts = products.length;
    const paidProducts = this.getPaidProductsCount(products);
    const unpaidProducts = this.getUnpaidProductsCount(products);
    const totalAmount = this.calculateOrderTotal(products);
    const paidAmount = this.calculatePaidAmount(products);
    const remainingAmount = this.calculateRemainingAmount(products);
    const isFullyPaid = this.areAllProductsPaid(products);

    return {
      totalProducts,
      paidProducts,
      unpaidProducts,
      totalAmount,
      paidAmount,
      remainingAmount,
      isFullyPaid,
    };
  }
}
