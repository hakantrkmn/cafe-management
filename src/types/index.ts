import {
  AllowedStaff,
  Cafe,
  Category,
  Extra,
  MenuItem,
  Order,
  OrderItem,
  OrderItemExtra,
  Table,
  User,
  UserRole,
} from "@prisma/client";

// Base types from Prisma
export type {
  AllowedStaff,
  Cafe,
  Category,
  Extra,
  MenuItem,
  Order,
  OrderItem,
  OrderItemExtra,
  Table,
  User,
  UserRole,
};

// Extended types with relations
export interface UserWithRelations extends User {
  cafe?: Cafe | null;
  managedCafe?: Cafe | null;
  orders?: Order[];
  allowedStaff?: AllowedStaff[];
}

export interface CafeWithRelations extends Cafe {
  manager: User;
  staff: User[];
  allowedStaff: AllowedStaff[];
  categories: Category[];
  menuItems: MenuItem[];
  extras: Extra[];
  tables: Table[];
  orders: Order[];
}

export interface CategoryWithRelations extends Category {
  cafe: Cafe;
  menuItems: MenuItem[];
}

export interface MenuItemWithRelations extends MenuItem {
  cafe: Cafe;
  category: Category;
  orderItems: OrderItem[];
}

export interface ExtraWithRelations extends Extra {
  cafe: Cafe;
  orderItemExtras: OrderItemExtra[];
}

export interface TableWithRelations extends Table {
  cafe: Cafe;
  orders: Order[];
}

export interface OrderWithRelations extends Omit<Order, "products"> {
  cafe: Cafe;
  table: Table;
  staff: User;
  orderItems: OrderItemWithRelations[];
  products: OrderProduct[]; // Her ürün için ayrı ödeme durumu
}

export interface OrderItemWithRelations extends OrderItem {
  order: Order;
  menuItem: MenuItem;
  orderItemExtras: OrderItemExtraWithRelations[];
}

export interface OrderItemExtraWithRelations extends OrderItemExtra {
  orderItem: OrderItem;
  extra: Extra;
}

export interface AllowedStaffWithRelations extends AllowedStaff {
  cafe: Cafe;
  user?: User | null;
}

// Product interface for individual product payment tracking
export interface OrderProduct {
  id: string; // menuItemId (foreign key to MenuItem)
  isPaid: boolean;
  price: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateCafeRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface CreateCategoryRequest {
  name: string;
  order: number;
}

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  price: number;
  description?: string;
}

export interface CreateExtraRequest {
  name: string;
  price: number;
}

export interface CreateTableRequest {
  name: string;
}

export interface CreateOrderRequest {
  tableId: string;
  orderItems: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  extras?: CreateOrderItemExtraRequest[];
}

export interface CreateOrderItemExtraRequest {
  extraId: string;
  quantity: number;
}

export interface UpdateOrderRequest {
  isPaid?: boolean;
  orderItems?: CreateOrderItemRequest[];
  products?: OrderProduct[];
  paidAt?: Date | null;
}

// Order Cart Types (Local State)
export interface OrderCartItem {
  id: string; // temporary ID for local state
  menuItemId: string;
  menuItemName: string;
  menuItemPrice: number;
  quantity: number;
  extras: OrderCartExtra[];
  subtotal: number;
}

export interface OrderCartExtra {
  extraId: string;
  extraName: string;
  extraPrice: number;
  quantity: number;
}

// Table Layout Types
export interface TablePosition {
  id: string;
  x: number;
  y: number;
}

export interface TableLayout {
  [tableId: string]: TablePosition;
}

// Table Status Types
export type TableStatus = "available" | "occupied" | "has-orders";

// Extra Selection Types
export interface ExtraWithQuantity {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SelectedExtra {
  extra: Extra;
  quantity: number;
}

export interface InviteStaffRequest {
  email: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cafeId?: string;
  cafe?: Cafe;
  managedCafe?: Cafe;
}

// Query key types
export const QueryKeys = {
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
  cafes: ["cafes"] as const,
  cafe: (id: string) => ["cafes", id] as const,
  categories: (cafeId: string) => ["categories", cafeId] as const,
  category: (id: string) => ["categories", id] as const,
  menuItems: (cafeId: string) => ["menuItems", cafeId] as const,
  menuItem: (id: string) => ["menuItems", id] as const,
  extras: (cafeId: string) => ["extras", cafeId] as const,
  extra: (id: string) => ["extras", id] as const,
  tables: (cafeId: string) => ["tables", cafeId] as const,
  table: (id: string) => ["tables", id] as const,
  orders: (cafeId: string) => ["orders", cafeId] as const,
  order: (id: string) => ["orders", id] as const,
  reports: (
    cafeId: string,
    dateRange: { from?: Date; to?: Date },
    timeRange: { start: string; end: string }
  ) => ["reports", cafeId, dateRange, timeRange] as const,
  allowedStaff: (cafeId: string) => ["allowedStaff", cafeId] as const,
} as const;
