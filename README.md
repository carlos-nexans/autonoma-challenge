# Assistant API - Monorepo Project

This is a monorepo project built with Turborepo, containing a NestJS API backend and a Next.js frontend application. The project uses pnpm as the package manager and implements a modern TypeScript-based architecture.

## Project Structure

```plaintext
.
├── apps
│   ├── api                       # NestJS backend application
│   └── web                       # Next.js frontend application
└── packages
    ├── @repo/api                 # Shared API types and interfaces
    ├── @repo/eslint-config       # ESLint configurations
    ├── @repo/jest-config         # Jest test configurations
    ├── @repo/typescript-config   # TypeScript configurations
    └── @repo/ui                  # Shared UI components
```

### Key Features

- Monorepo Architecture : Uses Turborepo for efficient monorepo management
- Type Safety : 100% TypeScript implementation across all packages and applications
- Cross-cutting Concerns : Shared types and interfaces located in packages/api/index
- Modern Stack :
  - Backend: NestJS with SQLite database
  - Frontend: Next.js with modern features
  - Shared configurations for consistent development experience

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start development servers:

```bash
pnpm run dev
```

This will start both the API and web applications in development mode.

## Applications

### API (NestJS)
- Located in apps/api
- Runs on port 3000
- Features:
  - SQLite database integration
  - OpenAI integration
  - Thread and message management
  - RESTful API endpoints
### Web (Next.js)
- Located in apps/web
- Modern Next.js application with:
  - Geist font optimization
  - Auto-updating development environment
  - Built-in API routes

## Deployment

The API is configured for deployment on Fly.io with the following specifications:

- 2GB memory allocation
- Shared CPU
- Persistent storage mounted at /mnt/assistant_data
- Automatic HTTPS enforcement
- Auto-scaling capabilities
The web application can be deployed on Vercel for optimal performance and integration.

## Technical Details

### Cross-cutting Concerns
The shared types and interfaces are centralized in packages/api/index , providing:

- Type consistency across applications
- Shared domain models
- Common utility types

### Configuration
- ESLint and Prettier configured for consistent code style
- Jest configured for testing
- TypeScript configurations shared across packages
- Docker configuration for production deployment