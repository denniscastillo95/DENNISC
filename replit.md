# Car Wash POS System

## Overview

This is a full-stack car wash point-of-sale (POS) system built with React, Express, TypeScript, and PostgreSQL. The application provides a comprehensive solution for managing car wash operations including customer management, service tracking, inventory control, and sales reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom car wash theme colors
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between client and server
- **Development**: Hot reloading with Vite middleware integration

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema migrations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Database Schema
The system includes tables for:
- **Users**: Authentication and role management
- **Customers**: Client information and contact details
- **Vehicles**: Customer vehicle registry with details
- **Car Wash Services**: Service catalog with pricing and duration
- **Inventory Items**: Stock management with min/max levels
- **Suppliers**: Vendor information for purchasing
- **Purchases**: Purchase orders and receiving
- **Sales**: Transaction records with service details
- **Sale Services**: Junction table for services per sale

### Core Features
1. **Dashboard**: Real-time metrics and service queue management
2. **Sales Management**: POS interface for processing car wash services
3. **Inventory Control**: Stock tracking with low stock alerts
4. **Purchase Management**: Supplier orders and receiving
5. **Service Catalog**: Configurable wash services and pricing
6. **Reporting**: Sales analytics and business insights

### UI Components
- Responsive design with mobile-first approach
- Consistent theming with car wash brand colors (blues and teals)
- Reusable component library based on Radix primitives
- Form components with validation and error handling
- Data tables with sorting and filtering capabilities

## Data Flow

### Client-Server Communication
1. **API Requests**: Frontend uses TanStack Query for data fetching
2. **Request Handling**: Express middleware processes and validates requests
3. **Database Operations**: Drizzle ORM handles database interactions
4. **Response Formatting**: Structured JSON responses with error handling
5. **Real-time Updates**: Query invalidation for immediate UI updates

### State Management
- Server state managed by TanStack Query with caching
- Form state handled by React Hook Form
- UI state managed by React component state
- Global state minimal, preferring server state synchronization

### Validation Strategy
- Shared Zod schemas between client and server
- Client-side validation for immediate feedback
- Server-side validation for security and data integrity
- Type safety throughout the application stack

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation library
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant utilities
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and React refresh
- **Backend**: tsx with Node.js for hot reloading
- **Database**: Neon PostgreSQL with connection pooling
- **Integration**: Vite middleware serves API and static files

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served by Express in production
- **Database**: Production PostgreSQL instance via DATABASE_URL

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **REPL_ID**: Replit-specific development features

### Replit Integration
- Custom Vite plugins for Replit development experience
- Runtime error modal overlay for debugging
- Development banner for external access
- Cartographer plugin for enhanced development tools

The application follows a modern full-stack architecture with strong typing, comprehensive validation, and excellent developer experience. The car wash domain is well-modeled with appropriate business logic separation and scalable data structures.