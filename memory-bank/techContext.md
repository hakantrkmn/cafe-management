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

## Technical Decisions Pending

1. **Real-time**: WebSockets vs Server-Sent Events vs polling
2. **Payment Processing**: Stripe vs local payment handling
3. **File Storage**: Local vs cloud storage for images
4. **Deployment**: Vercel vs other platforms

## Recently Completed Technical Work

### Manager Features Implementation (December 2024)

- **API Routes**: Complete CRUD operations for cafe, staff, and table management
- **Component Refactoring**: Modular architecture with reusable form components
- **Page Hooks**: Custom hooks for each dashboard page encapsulating business logic
- **Next.js 15 Compatibility**: Updated all dynamic route handlers for params await pattern
- **State Management**: TanStack Query integration for all manager features
- **UI Components**: Modern shadcn/ui components with Turkish localization

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
