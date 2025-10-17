# Technical Context: Cafe Management System

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: To be determined (likely shadcn/ui)
- **State Management**: React Context + useReducer (or Zustand)
- **Forms**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js (Next.js API routes)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js or Auth0
- **Real-time**: WebSockets or Server-Sent Events
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

## Technical Decisions Made

1. **Next.js App Router**: Modern routing with server components
2. **TypeScript**: Type safety throughout the application
3. **Tailwind CSS**: Utility-first styling approach
4. **Turbopack**: Fast development builds
5. **ESLint**: Code quality and consistency

## Technical Decisions Made

1. **Database**: MongoDB with Prisma ORM ✅
2. **Authentication**: NextAuth.js with credentials provider ✅

## Technical Decisions Pending

3. **UI Library**: shadcn/ui vs Chakra UI vs custom
4. **State Management**: Context vs Zustand vs Redux Toolkit
5. **Real-time**: WebSockets vs Server-Sent Events vs polling
6. **Deployment**: Vercel vs other platforms

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
