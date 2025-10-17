/**
 * Format utilities for the cafe management system
 */

/**
 * Format price as Turkish Lira
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

/**
 * Format order ID to show last 6 characters
 */
export const formatOrderId = (orderId: string): string => {
  return `#${orderId.slice(-6)}`;
};

/**
 * Format table name with proper display
 */
export const formatTableName = (tableName: string): string => {
  return tableName || "Bilinmeyen Masa";
};

/**
 * Format quantity with proper pluralization
 */
export const formatQuantity = (quantity: number, itemName: string): string => {
  if (quantity === 1) {
    return `${quantity} ${itemName}`;
  }
  return `${quantity} ${itemName}`;
};
