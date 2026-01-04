# Attendify - Student Attendance Tracker

## Overview

Attendify is a full-stack web application designed for students to track their class attendance. The app allows users to manage subjects, create weekly timetables, and record attendance status (present, absent, cancelled) for each class. It features a dashboard with attendance analytics, schedule generation, and historical attendance viewing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Charts**: Recharts for attendance analytics visualization
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod validation
- **Fonts**: DM Sans (body) and Outfit (display)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared routes file with Zod schema validation
- **Build System**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all database tables
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)
- **Tables**: users, sessions, subjects, weekly_schedule, attendance_records

### Authentication
- **Method**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/update on login via upsert pattern

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks for API calls
│       ├── pages/        # Route page components
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── replit_integrations/auth/  # Replit auth setup
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle database schema
│   ├── routes.ts     # API route definitions with Zod
│   └── models/       # Auth-related models
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared Route Definitions**: API routes are defined in `shared/routes.ts` with input/output Zod schemas, enabling type-safe API calls
- **Custom Hooks Pattern**: Each resource (subjects, schedule, attendance) has dedicated React hooks for CRUD operations
- **Protected Routes**: Frontend uses `ProtectedRoute` component; backend uses `requireAuth` middleware
- **Optimistic Updates**: React Query handles cache invalidation after mutations

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit OIDC**: OAuth2/OpenID Connect authentication
- **Required Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: Secret for session encryption
  - `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
  - `REPL_ID`: Replit environment identifier

### UI Libraries
- **Radix UI**: Accessible primitive components
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities

### Development
- **Vite**: Frontend dev server with HMR
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay