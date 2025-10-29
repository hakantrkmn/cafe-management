# 🍽️ Cafe Management System

Modern, full-featured cafe management system built with Next.js 15, TypeScript, and MongoDB. Designed for efficient cafe operations with role-based access control, real-time order management, and comprehensive reporting.

## ✨ Features

### 🔐 Authentication & User Management

- **Role-based Access Control**: Manager and Staff roles with different permissions
- **Secure Authentication**: NextAuth.js with JWT strategy
- **User Registration**: Separate signup flows for managers and staff
- **Staff Invitation System**: Managers can invite staff via email

### 🏪 Cafe Management

- **Multi-cafe Support**: Each manager can manage their own cafe
- **Cafe Settings**: Complete cafe information management
- **Staff Management**: Add, remove, and manage staff members
- **Table Management**: Drag-and-drop table layout editor

### 📋 Menu Management

- **Category Management**: Organize menu items by categories
- **Menu Items**: Full CRUD operations with descriptions and availability
- **Size Variations**: Support for different sizes (Small, Medium, Large) with individual pricing
- **Extras Management**: Additional items like toppings, sides, etc.
- **Campaign System**: Create promotional campaigns with multiple menu items

### 🛒 Order Management

- **Table-based Orders**: Visual table layout with drag-and-drop positioning
- **Order Creation**: Add menu items with size and extra selections
- **Cart Management**: Real-time cart updates with quantity management
- **Individual Product Payment**: Pay for individual items or entire orders
- **Order History**: Complete order tracking with payment status
- **Campaign Integration**: Apply campaigns to existing or new orders

### 📊 Reports & Analytics

- **Sales Reports**: Comprehensive sales analytics
- **Product Analytics**: Most popular items and consumption tracking
- **Revenue Tracking**: Daily, weekly, monthly revenue reports
- **Interactive Charts**: Visual data representation with Recharts

### 📱 Responsive Design

- **Mobile-first**: Optimized for tablets and mobile devices
- **Touch-friendly**: Gesture support for mobile interactions
- **Responsive Tables**: Adaptive layouts for different screen sizes

## 🚀 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern styling framework
- **shadcn/ui** - High-quality UI components
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **TanStack Query** - Server state management
- **Zustand** - Client state management

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication framework
- **bcryptjs** - Password hashing

### Development Tools

- **ESLint** - Code linting
- **Turbopack** - Fast development builds
- **TypeScript Strict Mode** - Enhanced type safety

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB database
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd cafe-management
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

```env
DATABASE_URL="mongodb://localhost:27017/cafe-management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

5. **Start Development Server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── campaigns/         # Campaign management
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   ├── menu/              # Menu management
│   ├── orders/            # Order management
│   ├── providers/         # Context providers
│   ├── reports/           # Reports and analytics
│   ├── staff/             # Staff management
│   ├── tables/            # Table management
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── queries/               # TanStack Query hooks
├── store/                 # Zustand stores
├── styles/                # CSS files
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio

# Linting
npm run lint         # Run ESLint
```

## 🎯 Key Features Deep Dive

### Order Management System

- **Visual Table Layout**: Drag-and-drop interface for table management
- **Real-time Updates**: Live order status updates
- **Cart Management**: Add/remove items with quantity control
- **Payment Processing**: Individual item or bulk payment options
- **Order History**: Complete transaction history with filtering

### Menu Management

- **Category Organization**: Hierarchical menu structure
- **Size-based Pricing**: Different prices for different sizes
- **Availability Control**: Enable/disable menu items
- **Campaign System**: Create promotional packages

### Role-based Access

- **Manager Features**: Full system access, staff management, reports
- **Staff Features**: Order management, table operations
- **Secure Authentication**: JWT-based session management

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User sign in

### Cafe Management

- `GET /api/cafes` - List cafes
- `POST /api/cafes` - Create cafe
- `PUT /api/cafes/[id]` - Update cafe
- `DELETE /api/cafes/[id]` - Delete cafe

### Orders

- `GET /api/cafes/[id]/orders` - List orders
- `POST /api/cafes/[id]/orders` - Create order
- `PUT /api/cafes/[id]/orders/[orderId]` - Update order
- `DELETE /api/cafes/[id]/orders/[orderId]` - Delete order

### Menu Management

- `GET /api/cafes/[id]/categories` - List categories
- `POST /api/cafes/[id]/categories` - Create category
- `GET /api/cafes/[id]/menu-items` - List menu items
- `POST /api/cafes/[id]/menu-items` - Create menu item

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/memory-bank` directory
- Review the component documentation in `/src/components`

## 🔮 Roadmap

### Upcoming Features

- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Kitchen display system
- [ ] Inventory management
- [ ] Staff scheduling
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-language support

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**
