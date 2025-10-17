# Active Context: Cafe Management System

## Current Status

**Project Phase**: Menu Management System Complete - Ready for Order System
**Last Updated**: December 2024
**Current Focus**: Order System Implementation and Staff Registration Flow
**Development Progress**: 75% complete

## Recent Changes

- ✅ Next.js 15 project initialized with TypeScript
- ✅ Tailwind CSS 4 configured
- ✅ ESLint setup with Next.js configuration
- ✅ Basic project structure established
- ✅ Memory bank documentation created
- ✅ MongoDB Prisma schema created with all models
- ✅ Prisma Client generated successfully
- ✅ NextAuth.js authentication system implemented
- ✅ Custom useAuth hook created
- ✅ Sign-in and sign-up pages created
- ✅ Dashboard with role-based access created
- ✅ Dashboard redesigned with shadcn/ui components
- ✅ TanStack Query integration completed
- ✅ Modern form components with validation
- ✅ Responsive dashboard layout with proper navigation
- ✅ Complete authentication flow with role-based access
- ✅ Modern dashboard UI with Turkish localization
- ✅ User profile management with avatar and dropdown
- ✅ Role-based dashboard cards (Manager vs Staff views)
- ✅ Comprehensive Prisma schema with all business models
- ✅ Manager features implementation (Cafe Settings, Staff Management, Table Management)
- ✅ API routes for cafe, staff, and table management
- ✅ TanStack Query hooks for all manager features
- ✅ Component refactoring for better maintainability
- ✅ Next.js 15 params await compatibility fixes
- ✅ Page hooks refactoring - Custom hooks for each dashboard page
- ✅ Complete manager features implementation with modern UI
- ✅ API routes for cafe, staff, and table management fully functional
- ✅ Component architecture optimized for maintainability
- ✅ Next.js 15 compatibility ensured across all dynamic routes
- ✅ Menu Management System implemented with tab-based architecture
- ✅ Separate save operations for categories, menu items, and extras
- ✅ Local state management with batch save functionality
- ✅ Modern UI with shadcn/ui components and Turkish localization
- ✅ Menu page refactored into separate tab components (CategoryTab, MenuItemTab, ExtraTab)
- ✅ Dialog components separated by feature (CategoryDialogs, MenuItemDialogs, ExtraDialogs)
- ✅ TanStack Query cache invalidation fixed for real-time updates
- ✅ Tab design optimized with responsive layout and esthetic container sizing
- ✅ CSS architecture improved with component classes in globals.css

## Current Work Focus

### Immediate Next Steps

1. **Order System**: Create order taking and management functionality
2. **Order Processing**: Implement order workflow from creation to payment
3. **Staff Registration**: Complete staff registration flow with allowedStaff integration
4. **Real-time Updates**: Add live order status and notifications
5. **Payment Integration**: Implement payment processing and receipt generation

### Active Decisions Made

1. **UI Library**: shadcn/ui components implemented ✅
2. **State Management**: TanStack Query for server state ✅
3. **Authentication**: NextAuth.js with credentials provider ✅
4. **Database**: MongoDB with Prisma ORM ✅
5. **Styling**: Tailwind CSS with modern design system ✅
6. **Component Architecture**: Modular, reusable components ✅
7. **API Design**: RESTful endpoints with proper error handling ✅
8. **Form Management**: React Hook Form + Zod validation ✅

## Key Patterns and Preferences

### Development Approach

- **Type-first development**: Define types before implementation
- **Component-driven**: Build reusable, composable components
- **API-first**: Design APIs before UI implementation
- **Mobile-responsive**: Ensure all interfaces work on tablets
- **Turkish localization**: All user-facing text in Turkish
- **CSS Architecture**: Component classes in globals.css, no hardcoded styles
- **Esthetic Design**: Centered layouts with max-width containers for better UX

### Code Organization

- **Feature-based structure**: Group related functionality
- **Separation of concerns**: Clear boundaries between layers
- **Consistent naming**: Follow established conventions
- **Documentation**: Maintain clear code documentation
- **shadcn/ui components**: Consistent UI component library
- **Component modularity**: Small, focused, reusable components
- **Type safety**: Strong TypeScript typing throughout
- **Page hooks pattern**: Custom hooks encapsulate page logic and state management
- **Tab component architecture**: Separate components for each tab with independent state management
- **Dialog component separation**: Feature-specific dialog components for better maintainability

### Authentication Patterns

- **Role-based access**: Manager vs Staff permissions
- **Session management**: NextAuth.js with JWT strategy
- **Protected routes**: Automatic redirects for unauthenticated users
- **User context**: Global auth state with TanStack Query

## Important Learnings

### Technical Insights

- Next.js 15 with App Router provides excellent foundation
- Tailwind CSS 4 offers modern styling capabilities
- TypeScript strict mode ensures type safety
- Turbopack provides fast development experience
- shadcn/ui components integrate seamlessly with Tailwind
- TanStack Query simplifies server state management

### Project Insights

- Cafe management requires real-time updates
- Mobile-first design is crucial for POS systems
- Role-based access control is essential
- Turkish localization improves user adoption
- Dashboard cards provide clear navigation for different roles
- Avatar and user profile management enhances UX
- Page hooks pattern significantly improves code organization and maintainability
- Custom hooks enable better separation of concerns between UI and business logic

## Current Challenges

1. **Order System**: Multi-step order flow with extras, modifications, and table assignment
2. **Staff Registration Flow**: Integration between allowedStaff and user registration
3. **Real-time Requirements**: Balancing performance with live updates
4. **Payment Integration**: Secure payment processing implementation
5. **Order Tracking**: Kitchen display and order status management

## Next Session Priorities

1. **Order System**: Implement order creation and tracking functionality
2. **Staff Registration**: Complete allowedStaff integration with user registration
3. **Order Processing**: Complete order workflow from creation to payment
4. **Real-time Updates**: Add live order status and notifications
5. **Payment Integration**: Implement payment processing and receipt generation

## Context for Future Development

- Focus on core business features (orders, menu, tables)
- Ensure scalability for future features
- Maintain clean architecture for easy maintenance
- Prioritize user experience and performance
- Turkish localization for all user interfaces
