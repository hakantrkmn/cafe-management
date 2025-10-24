# System Patterns: Cafe Management System

## Architecture Overview

The system follows a modern full-stack architecture with Next.js App Router, emphasizing:

- Server-side rendering for performance
- Client-side interactivity where needed
- API-first design for flexibility
- Component-based UI architecture

## Core System Patterns

### 0. Individual Product Payment Pattern

**Purpose**: Enable individual product payment tracking within a single order

**Implementation**:

- Each Order has a `products: Json[]` field containing `OrderProduct` objects
- Each product has: `{id: string, isPaid: boolean, price: number}`
- Products array populated during order creation with individual entries
- Individual products can be marked as paid separately
- Order is marked as paid only when all products are paid

**Key Components**:

- Order creation: Products array populated with individual product entries
- Individual payment: `markProductAsPaid` function updates specific product
- Bulk payment: All products marked as paid simultaneously
- Order completion: Order `isPaid` becomes true when all products are paid
- UI display: Each product shown separately with individual payment buttons

**Data Structure**:

```typescript
interface OrderProduct {
  id: string; // menuItemId (foreign key to MenuItem)
  isPaid: boolean;
  price: number;
}
```

### 1. Products Array Analytics Pattern

**Purpose**: Track product consumption per table for analytics and reporting

**Implementation**:

- Each Order has a `products: Json[]` field with individual payment tracking
- Products array populated when orders are paid
- Duplicate products allowed for accurate quantity tracking
- Table-level analytics by aggregating paid orders

**Key Components**:

- Order creation: Products array populated with order items
- Order updates: New products appended to existing array
- Payment processing: Products array finalized and locked
- Analytics: Aggregate products from all paid orders per table

## Core System Patterns

### 1. App Router Pattern

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
│   ├── layout.tsx         # Dashboard layout
│   ├── page.tsx          # Dashboard home
│   ├── orders/
│   ├── menu/
│   ├── inventory/
│   └── staff/
└── api/
    ├── auth/
    ├── orders/
    ├── menu/
    └── inventory/
```

### 2. Component Architecture

- **Atomic Design**: Atoms → Molecules → Organisms → Templates
- **Composition over Inheritance**: Flexible component composition
- **Props Interface**: Strongly typed component props
- **Custom Hooks**: Business logic separation
- **Page Hooks**: Page-specific logic encapsulation
- **shadcn/ui Components**: Consistent, accessible UI primitives
- **Role-based Rendering**: Conditional component display based on user roles
- **Modular Components**: Small, focused, reusable components
- **Form Components**: Dedicated form components with validation
- **Feature Components**: Domain-specific components (StaffList, TableCard, etc.)

### 3. State Management Pattern

```typescript
// Server state with TanStack Query
interface AppState {
  auth: AuthState; // NextAuth.js session
  orders: OrdersState; // TanStack Query cache
  menu: MenuState; // TanStack Query cache
  inventory: InventoryState; // TanStack Query cache
  staff: StaffState; // TanStack Query cache
  ui: UIState; // Local component state
}

// Auth state structure
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isManager: boolean;
  isStaff: boolean;
}
```

### 4. API Design Pattern

- **RESTful endpoints** with consistent naming
- **Type-safe API calls** with TypeScript
- **Error handling** with standardized responses
- **Authentication** via NextAuth.js middleware
- **TanStack Query integration** for caching and synchronization
- **MongoDB with Prisma** for type-safe database operations

## Data Flow Patterns

### 1. Order Processing Flow

```
Customer Order → POS Interface → Order Queue → Kitchen Display → Completion → Payment → Receipt
```

### 2. Inventory Management Flow

```
Stock Update → Inventory Check → Low Stock Alert → Reorder Process → Supplier Integration
```

### 3. Staff Management Flow

```
Schedule Creation → Shift Assignment → Time Tracking → Performance Analytics
```

## Component Patterns

### 1. Layout Components

- **RootLayout**: Global app structure with providers
- **DashboardLayout**: Main application layout with header and navigation
- **AuthLayout**: Authentication pages layout
- **PageLayout**: Individual page layouts
- **ModalLayout**: Overlay components

### 2. Form Components

- **FormField**: Reusable form input with shadcn/ui components
- **FormSection**: Grouped form fields
- **FormValidation**: Real-time validation with Zod schemas
- **FormSubmission**: Loading and error states with TanStack Query
- **SignInForm**: Authentication form with validation
- **SignUpForm**: Registration form with role selection
- **CafeForm**: Cafe creation and update form ✅
- **InviteStaffForm**: Staff invitation form ✅
- **TableForm**: Table creation and update form ✅
- **MenuForm**: Menu item creation and update form ✅
- **CategoryForm**: Category creation and update form ✅
- **ExtraForm**: Extra creation and update form ✅
- **OrderForm**: Order creation and modification form ✅

### 3. Data Display Components

- **DataTable**: Sortable, filterable tables
- **Card**: Information display cards with shadcn/ui
- **DashboardCards**: Role-based navigation cards ✅
- **UserInfo**: User profile display component ✅
- **StaffList**: Staff management list component ✅
- **TableList**: Table management list component ✅
- **TableCard**: Individual table display component ✅
- **TableDialogs**: Modal dialogs for table operations ✅
- **MenuList**: Menu item display and management ✅
- **CategoryTabs**: Category management with tab interface ✅
- **ExtrasList**: Extra management list component ✅
- **MenuItemCard**: Individual menu item display ✅
- **MenuDialogs**: Modal dialogs for menu operations ✅ (Refactored into separate dialog components)
- **CategoryDialogs**: Category-specific dialogs (add/edit/delete) ✅
- **MenuItemDialogs**: Menu item-specific dialogs (add/edit/delete) ✅
- **ExtraDialogs**: Extra-specific dialogs (add/edit/delete) ✅
- **SaveButton**: Batch save functionality ✅
- **OrderList**: Order tracking and management ✅
- **TableLayoutEditor**: Drag-and-drop table positioning with localStorage persistence ✅
- **OrderDialog**: Modal-based order creation with tabbed interface ✅
- **MenuSelection**: Category-based menu browsing with responsive grid ✅
- **OrderSummary**: Cart management with individual product payment processing ✅
- **ExtraSelectionDialog**: Extras selection with quantity management ✅
- **useOrdersPage**: Complete order page logic with cart management and table operations ✅
- **Individual Product Payment**: Each product can be paid separately within an order ✅
- **markProductAsPaid**: Function to mark individual products as paid ✅
- **Chart**: Data visualization (future)
- **StatusIndicator**: Real-time status display (future)

## Integration Patterns

### 1. Real-time Updates

- **WebSocket connections** for live data
- **Server-sent events** for notifications
- **Optimistic updates** for better UX

### 2. Offline Support

- **Service worker** for basic offline functionality
- **Local storage** for temporary data
- **Sync queue** for when connection returns

### 3. Payment Integration

- **Stripe/PayPal** integration
- **Cash payment** handling
- **Receipt generation**

## Security Patterns

### 1. Authentication

- **NextAuth.js** with JWT strategy for session management
- **Role-based access control** (RBAC) with Manager/Staff roles
- **Route protection** with automatic redirects
- **bcryptjs** for password hashing
- **Credentials provider** for email/password authentication

### 2. Data Validation

- **Input sanitization** on all forms
- **Type validation** with Zod schemas
- **SQL injection prevention**

### 3. Error Handling

- **Global error boundary** for React errors
- **API error standardization**
- **User-friendly error messages**

## Performance Patterns

### 1. Loading Optimization

- **Code splitting** by route
- **Lazy loading** for heavy components
- **Image optimization** with Next.js

### 2. Caching Strategy

- **API response caching**
- **Static generation** for public pages
- **Client-side caching** for user data

### 3. Real-time Efficiency

- **Connection pooling** for WebSockets
- **Debounced updates** for frequent changes
- **Selective updates** based on user context

## Page Hooks Pattern

### 1. Page-Specific Custom Hooks

```typescript
// Page hooks encapsulate all page logic
export function useFeaturePage() {
  const { isAuthenticated, isLoading, isManager } = useAuth();
  const { data, isLoading: dataLoading } = useFeatureData();
  const mutation = useFeatureMutation();

  const handleAction = async (data) => {
    await mutation.mutateAsync(data);
  };

  return {
    data,
    isLoading: isLoading || dataLoading,
    isAuthenticated,
    isManager,
    handleAction,
  };
}
```

### 2. Benefits

- **Separation of Concerns**: UI logic separated from business logic
- **Reusability**: Page logic can be reused across components
- **Testability**: Hooks can be tested independently
- **Maintainability**: Changes to business logic centralized
- **Consistency**: Uniform patterns across all pages
- **Manager Features**: Complete implementation with modern UI components
- **Menu Management**: Tab-based architecture with separate save operations
- **Local State Management**: Batch save functionality with status tracking
- **API Integration**: RESTful endpoints with proper error handling and authentication
- **Component Modularity**: Small, focused, reusable components with clear separation of concerns
- **Tab Component Architecture**: Separate components for each tab (CategoryTab, MenuItemTab, ExtraTab)
- **Dialog Component Separation**: Feature-specific dialog components for better maintainability
- **CSS Architecture**: Component classes in globals.css for maintainable styling
- **Responsive Design**: Esthetic container sizing with max-width constraints
- **TanStack Query Optimization**: Fixed cache invalidation for real-time updates
- **Order System Architecture**: Complete order workflow with drag-and-drop table layout
- **Local State Management**: Cart state management with localStorage persistence
- **Responsive Order Interface**: Mobile-optimized components with proper spacing
- **Tab-based Order UI**: Replaced resizable panels with tabbed interface for better UX
- **Bulk Operations**: "Mark All as Paid" functionality for efficient payment processing
- **API Data Relationships**: Proper include statements for order data with menuItem and extras
- **Order Page Hook**: Complete order page logic with cart management and table operations
- **Transaction Handling**: Database transactions for order creation and payment processing
- **Table Status Management**: Real-time table status tracking (available, occupied, has-orders)
- **Cart Management**: Add, remove, update quantities with extras support and localStorage persistence

### 2. Order Product Management Pattern

**Purpose**: Centralized management of product add/remove operations with proper type safety and database consistency

**Implementation**:

- `OrderProductUtils` class for all product manipulation operations
- Centralized calculation logic for order totals and payment status
- Type-safe interfaces replacing all `any` types
- Proper database updates for `totalAmount` when products are deleted
- Separated logic for `markProductAsPaid` vs `deleteProduct` operations
- Production-ready code with debug log cleanup

**Key Components**:

- `OrderProductUtils.markProductAsPaid()`: Mark individual products as paid
- `OrderProductUtils.removeProductFromOrder()`: Remove products and recalculate totals
- `OrderProductUtils.calculateOrderTotal()`: Calculate order totals from products array
- `OrderProductUtils.areAllProductsPaid()`: Check if all products in order are paid
- `OrderProductUtils.getProductsByPaymentStatus()`: Filter products by payment status
- **Extra Name Display**: Extras show proper names from OrderProductExtra.name field
- **Fallback Logic**: System attempts to find extra name from orderItemExtras if not available in product.extras
- **Multi-OrderItem Support**: OrderProducts component handles multiple orderItems for same product
- **Order History Tab**: Complete order history system with paid orders display and date filtering
- **Order History Component**: Detailed paid orders view with staff information and product details
- **Order History API**: getTablePaidOrders function with date range filtering and sorting
- **Order History UI**: Third tab in OrderDialog with swipe gesture support for 3-tab navigation
- **Order History Styling**: Responsive design with comprehensive CSS classes for order history display
- **Order History Data Safety**: Null/undefined date handling with user-friendly error messages and validation

**Data Structure**:

```typescript
interface OrderProduct {
  id: string;
  isPaid: boolean;
  price: number;
  size?: string;
  extras?: OrderProductExtra[];
}

interface OrderProductExtra {
  id: string; // extraId
  name?: string; // ekstra adı (optional, eski veriler için)
  price: number; // ekstra fiyatı
}

interface OrderOperations {
  getTableOrders: (tableId: string) => OrderWithRelations[];
  saveOrder: (tableId: string, cartItems: OrderCartItem[]) => Promise<void>;
  addToExistingOrder: (
    orderId: string,
    cartItems: OrderCartItem[]
  ) => Promise<void>;
}
```

**API Route Logic**:

- `markProductAsPaid`: Updates only `isPaid` status, preserves `totalAmount`
- `deleteProduct`: Updates both `isPaid` status and `totalAmount`
- Conditional `totalAmount` update based on request body content
- Proper type safety with Prisma JSON field handling
- Database consistency ensured with proper transaction handling

**Frontend Integration**:

- `useOrderOperations` hook uses centralized utilities
- Proper query invalidation after operations
- Type-safe error handling throughout
- Clean separation of concerns between UI and business logic
- Extra price display in order summary for enhanced UX

### 3. Reports System Pattern

**Purpose**: Provide comprehensive analytics and reporting for business insights

**Implementation**:

- Reports API with date/time filtering and data aggregation
- Reports components with summary cards and detailed tables
- TanStack Query integration for efficient data caching
- Role-based access control (Manager only)
- Flexible filtering with date ranges and time periods
- Chart integration with Recharts library for data visualization

**Key Components**:

- Reports API: `/api/cafes/[id]/reports` with comprehensive analytics
- ReportsPage: Main reports interface with filter management
- ReportsFilters: Date range and time range filtering components
- ReportsSummary: Summary cards with key metrics display
- ReportsTable: Detailed data table with sortable columns
- ReportsCharts: Chart container with 6 different chart types
- useReportsData: Data fetching hook with TanStack Query
- useReportsPage: Page logic hook with filter management

**Chart Components**:

- ProductSalesChart: Bar chart with product selection filter
- SalesTrendChart: Line chart for daily revenue trends
- CategoryDistributionChart: Pie chart for category revenue distribution
- PaymentStatusChart: Pie chart for payment status distribution
- TablePerformanceChart: Bar chart for table performance metrics
- HourlySalesChart: Area chart for hourly sales distribution

**Data Structure**:

```typescript
interface ReportsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalTables: number;
    averageOrderValue: number;
  };
  orders: Order[];
  topProducts: ProductAnalytics[];
  tableStats: TableStat[];
  chartData: {
    hourlyRevenue: { hour: number; revenue: number; orderCount: number }[];
    dailyRevenue: { date: string; revenue: number; orderCount: number }[];
    categoryDistribution: {
      category: string;
      revenue: number;
      percentage: number;
    }[];
    paymentStatus: { status: string; count: number; percentage: number }[];
  };
}
```

**Enhanced Analytics Features**:

- Order analytics with revenue calculations
- Product consumption tracking with size-based analysis
- Table utilization and performance metrics
- Date range and time range filtering with time zone support
- Real-time data updates with TanStack Query caching
- Interactive charts with filtering capabilities
- Product selection filters for detailed analysis
- Category and size-based filtering for top products
- Peak time analysis for products
- Comprehensive chart visualization with Recharts

### 4. Order History Pattern

**Purpose**: Provide comprehensive order history tracking with paid orders display and date filtering

**Implementation**:

- Order History component with detailed paid orders display
- Date range filtering with from/to date pickers
- Staff information and payment timestamp display
- Product details with extras and size information
- Read-only interface for historical data viewing
- Responsive design with mobile-optimized layout

**Key Components**:

- OrderHistory: Main component for displaying paid orders with filtering
- getTablePaidOrders: API function to fetch paid orders with date filtering
- OrderDialog: Third tab integration with swipe gesture support
- Date filtering: From/to date pickers with validation
- Staff information: Display of staff member who created the order
- Product details: Complete product information with extras and pricing

**Data Structure**:

```typescript
interface OrderHistoryProps {
  paidOrders: OrderWithRelations[];
  selectedTableName?: string;
}

interface OrderHistoryFilters {
  dateFrom: string;
  dateTo: string;
}
```

**UI Features**:

- Date range filtering with clear filters functionality
- Order count display and empty state handling
- Staff information with user icon
- Product details with size and extras display
- Payment timestamp with Turkish date formatting
- Responsive card layout with proper spacing
- Error handling for invalid dates with user-friendly messages

**Navigation Integration**:

- Third tab in OrderDialog with "Sipariş Geçmişi" label
- Swipe gesture support for 3-tab navigation (Menu → Orders → History)
- Consistent styling with existing order components
- Mobile-optimized touch interactions

**Data Safety**:

- Null/undefined date handling with fallback messages
- Invalid date validation with user-friendly error messages
- Date filtering with proper validation and error handling
- Graceful degradation for missing data
