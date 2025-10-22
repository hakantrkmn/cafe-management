# Technical Context: Cafe Management System

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js (Next.js API routes)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Password Hashing**: bcryptjs
- **Real-time**: To be determined (WebSockets vs Server-Sent Events)
- **File Storage**: Local or cloud storage for images

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint 9 with Next.js config
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Turbopack (Next.js default)
- **Version Control**: Git

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main application
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── store/                 # State management
```

## Development Setup

- **Node.js**: Version 18+ required
- **Package Manager**: npm (lock file present)
- **Development Server**: `npm run dev` with Turbopack
- **Build**: `npm run build` with Turbopack
- **Linting**: `npm run lint`

## Key Dependencies

- **React**: 19.1.0 (latest)
- **Next.js**: 15.5.6 (latest stable)
- **TypeScript**: ^5 (latest)
- **Tailwind CSS**: ^4 (latest)
- **Prisma**: ^6.17.1 (database ORM)
- **NextAuth.js**: ^4.24.11 (authentication)
- **TanStack Query**: ^5.90.5 (server state management)
- **React Hook Form**: ^7.65.0 (form handling)
- **Zod**: ^4.1.12 (validation)
- **shadcn/ui**: Radix UI components with Tailwind
- **bcryptjs**: ^3.0.2 (password hashing)
- **Sonner**: ^2.0.7 (toast notifications)
- **Lucide React**: ^0.546.0 (icons)
- **@dnd-kit/core**: ^6.3.1 (drag and drop functionality)
- **@dnd-kit/sortable**: ^10.0.0 (sortable drag and drop)
- **@dnd-kit/utilities**: ^3.2.2 (drag and drop utilities)
- **react-resizable-panels**: ^3.0.6 (resizable panel components)
- **recharts**: ^2.12.7 (chart library for data visualization)

## Technical Decisions Made

1. **Next.js App Router**: Modern routing with server components ✅
2. **TypeScript**: Type safety throughout the application ✅
3. **Tailwind CSS**: Utility-first styling approach ✅
4. **Turbopack**: Fast development builds ✅
5. **ESLint**: Code quality and consistency ✅
6. **Database**: MongoDB with Prisma ORM ✅
7. **Authentication**: NextAuth.js with credentials provider ✅
8. **UI Library**: shadcn/ui with Radix UI primitives ✅
9. **State Management**: TanStack Query for server state ✅
10. **Forms**: React Hook Form + Zod validation ✅
11. **Password Hashing**: bcryptjs ✅
12. **Localization**: Turkish language support ✅
13. **Component Architecture**: Modular, reusable components ✅
14. **API Design**: RESTful endpoints with proper error handling ✅
15. **Next.js 15 Compatibility**: Params await pattern for dynamic routes ✅
16. **Drag and Drop**: @dnd-kit for table layout management ✅
17. **Local Storage**: Table position persistence with localStorage ✅
18. **Responsive Design**: Mobile-first order interface ✅
19. **Order System**: Complete order workflow with cart management ✅
20. **Transaction Handling**: Database transactions for data consistency ✅
21. **Reports System**: Complete analytics and reporting system ✅
22. **Reports API**: Comprehensive reports endpoint with analytics ✅
23. **Reports Components**: Modern UI components for reports display ✅
24. **TanStack Query Integration**: Efficient data caching for reports ✅
25. **Chart Integration**: Recharts library for data visualization ✅
26. **Enhanced Reports**: Product selection filters and category/size filtering ✅
27. **Order Product Management**: Centralized utilities with type safety and database consistency ✅
28. **Production Optimization**: Code quality, performance, and maintainability improvements ✅

## Technical Decisions Pending

1. **Real-time**: WebSockets vs Server-Sent Events vs polling
2. **Payment Processing**: Stripe vs local payment handling
3. **File Storage**: Local vs cloud storage for images
4. **Deployment**: Vercel vs other platforms

## Recently Completed Technical Work

### Manager Features Implementation (December 2024 - October 2025)

- **API Routes**: Complete CRUD operations for cafe, staff, and table management
- **Component Refactoring**: Modular architecture with reusable form components
- **Page Hooks**: Custom hooks for each dashboard page encapsulating business logic
- **Next.js 15 Compatibility**: Updated all dynamic route handlers for params await pattern
- **State Management**: TanStack Query integration for all manager features
- **UI Components**: Modern shadcn/ui components with Turkish localization

### Menu Management System Implementation (December 2024 - October 2025)

- **Tab-based Architecture**: Separate tabs for Categories, Menu Items, and Extras
- **Local State Management**: Batch save functionality with status tracking
- **API Routes**: Separate endpoints for categories, menu items, and extras
- **Component Architecture**: Modular components with custom page hooks
- **Form Management**: React Hook Form + Zod validation for all menu forms
- **UI/UX**: Modern interface with status badges and unsaved changes indicators

### Menu Page Refactoring & Design Optimization (December 2024 - October 2025)

- **Component Separation**: Refactored into separate tab components (CategoryTab, MenuItemTab, ExtraTab)
- **Dialog Architecture**: Separated dialogs by feature (CategoryDialogs, MenuItemDialogs, ExtraDialogs)
- **CSS Architecture**: Component classes in globals.css for maintainable styling
- **Responsive Design**: Esthetic container sizing with max-width constraints
- **TanStack Query Fix**: Fixed cache invalidation for real-time updates
- **UI Optimization**: Centered layouts with proper spacing and typography

### Staff Order System Implementation (December 2024)

- **Complete Order Management**: Full order workflow from table selection to payment processing
- **Drag-and-Drop Interface**: @dnd-kit integration for table layout management with localStorage persistence
- **Order Dialog System**: Modal-based order creation with tabbed interface (Menu Selection + Order Summary)
- **Cart Management**: Add, remove, update quantities with extras selection and real-time calculations
- **API Integration**: Complete order CRUD operations with proper data relationships and transaction handling
- **Table Status Tracking**: Real-time table status (available, occupied, has-orders) with visual indicators
- **Responsive Design**: Mobile-optimized components with proper spacing and layout
- **Bulk Operations**: "Mark All as Paid" functionality for efficient payment processing
- **Data Relationships**: Complete API includes for menuItem, extras, and order relationships
- **Transaction Handling**: Database transactions for order creation and payment processing
- **Local Storage**: Table position persistence across sessions for improved UX

### Reports System Implementation (December 2024)

- **Complete Analytics Dashboard**: Comprehensive reports interface with date/time filtering
- **Reports API**: `/api/cafes/[id]/reports` endpoint with order analytics and table statistics
- **Reports Components**: ReportsPage, ReportsFilters, ReportsSummary, ReportsTable components
- **Data Hooks**: useReportsData and useReportsPage hooks with TanStack Query integration
- **Analytics Features**: Order analytics, product consumption tracking, table utilization metrics
- **Filter Management**: Flexible date range and time range filtering with real-time updates
- **Performance Optimization**: Efficient data aggregation and caching strategies
- **Security**: Role-based access control (Manager only) with proper authentication
- **User Experience**: Turkish localization with responsive design and intuitive interface

### Order Product Management Refactoring (December 2024)

- **Centralized Utilities**: Created `OrderProductUtils` class for all product operations
- **Type Safety Enhancement**: Eliminated all `any` types with proper interfaces
- **Database Consistency**: Fixed `totalAmount` not updating when products are deleted
- **API Route Optimization**: Separated `markProductAsPaid` and `deleteProduct` logic
- **Frontend Integration**: Updated hooks to use centralized utilities
- **Code Organization**: Centralized product logic in dedicated utility class
- **Error Handling**: Improved error handling with proper type safety
- **Performance Optimization**: Reduced code duplication and improved maintainability
- **Extra Price Display**: Added price display for extras in order summary
- **Production Readiness**: Removed debug logs and optimized for production deployment

## Performance Considerations

- Server-side rendering for SEO and initial load
- Client-side hydration for interactivity
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Caching strategies for API responses

## Security Considerations

- Input validation and sanitization
- Authentication and authorization
- HTTPS enforcement
- Environment variable management
- SQL injection prevention
- XSS protection
