# Ranking System - Full-Stack Admin Project

This project is a completed Next.js TypeScript ranking application featuring a comprehensive admin dashboard. It ships with a JSON-backed persistence layer and optional Kysely-powered SQLite integration.

## Project Overview
- **Status:** ✅ Completed – production-ready full-stack implementation
- **Frontend:** Next.js 14 App Router, TypeScript, Mantine UI
- **Backend:** tRPC for type-safe APIs (JSON repository by default, Kysely/SQLite optional)
- **Database:** File-based JSON storage (`data/database.json`) with an alternative SQLite layer (`data/app.db`) accessed through Kysely
- **Authentication:** NextAuth.js (Google OAuth)
- **Infrastructure:** Docker Compose for development and production

### Architecture
- **Frontend:** Next.js 14 App Router, TypeScript, Mantine UI
- **Backend:** tRPC routing, shared validation via Zod
- **Persistence Options:**
  - JSON repository (default master branch)
  - SQLite (`better-sqlite3`) with Kysely query builder (feature branch)
- **Authentication:** NextAuth.js with Google OAuth
- **Infrastructure:** Docker Compose with dev/prod profiles

### Key Features Implemented
- ⭐ Public ranking interface with 1–10 star ratings
- 🔐 Secure admin authentication system
- 📊 Admin dashboard with real-time statistics and charts
- 🏷️ Category and item management workflows
- 👥 User role management (USER / ADMIN / SUPER_ADMIN)
- 📝 Complete CRUD operations via tRPC
- 🐳 Full Docker containerization

### Database Schema
- **Users:** Authentication profiles with roles
- **Categories:** Thematic organization for ranking items
- **RankingItems:** Core entities with metadata and aggregated ratings
- **Ratings:** User scores tied to items
- **Accounts/Sessions:** NextAuth OAuth persistence records

### Admin System
- Dashboard at `/admin` with overview metrics, rating charts, and recent activity
- Google OAuth sign-in with role-aware redirects
- Role-based access control for all admin routes
- Management interfaces for categories, ranking items, users, and ratings
- Live analytics sourced from JSON or SQLite (depending on deployment)

### Development Setup
1. Install dependencies with `npm install`
2. Configure `.env.local` using provided template (NextAuth + Google credentials)
3. Start locally with `npm run dev` or `docker compose --profile dev up nextjs-ranking-app-dev`
4. First run auto-bootstraps JSON data (`data/database.json`); optional SQLite bootstrap handled by `src/lib/database/sqlite.ts` when using Kysely
5. Sign in with Google and promote your account to `SUPER_ADMIN` via data file or SQLite editor as needed

### Project Structure Complete
- ✅ Next.js App Router with TypeScript
- ✅ Mantine UI component library integration
- ✅ tRPC API routers for all entities
- ✅ NextAuth.js authentication setup
- ✅ JSON repository data layer with optional Kysely/SQLite backend
- ✅ Docker development and production environments
- ✅ Admin dashboard UI components and analytics
- ✅ Environment variable validation (`src/env.ts`)
- ✅ Comprehensive documentation

This project demonstrates modern full-stack development practices with type safety, secure authentication, and a polished admin experience.// filepath: d:\backup\win-user\Documents\htdocs\SmallTest\.github\copilot-instructions.md
# Ranking System - Full-Stack Admin Project

This project is a completed Next.js TypeScript ranking application featuring a comprehensive admin dashboard. It ships with a JSON-backed persistence layer and optional Kysely-powered SQLite integration.

## Project Overview
- **Status:** ✅ Completed – production-ready full-stack implementation
- **Frontend:** Next.js 14 App Router, TypeScript, Mantine UI
- **Backend:** tRPC for type-safe APIs (JSON repository by default, Kysely/SQLite optional)
- **Database:** File-based JSON storage (`data/database.json`) with an alternative SQLite layer (`data/app.db`) accessed through Kysely
- **Authentication:** NextAuth.js (Google OAuth)
- **Infrastructure:** Docker Compose for development and production

### Architecture
- **Frontend:** Next.js 14 App Router, TypeScript, Mantine UI
- **Backend:** tRPC routing, shared validation via Zod
- **Persistence Options:**
  - JSON repository (default master branch)
  - SQLite (`better-sqlite3`) with Kysely query builder (feature branch)
- **Authentication:** NextAuth.js with Google OAuth
- **Infrastructure:** Docker Compose with dev/prod profiles

### Key Features Implemented
- ⭐ Public ranking interface with 1–10 star ratings
- 🔐 Secure admin authentication system
- 📊 Admin dashboard with real-time statistics and charts
- 🏷️ Category and item management workflows
- 👥 User role management (USER / ADMIN / SUPER_ADMIN)
- 📝 Complete CRUD operations via tRPC
- 🐳 Full Docker containerization

### Database Schema
- **Users:** Authentication profiles with roles
- **Categories:** Thematic organization for ranking items
- **RankingItems:** Core entities with metadata and aggregated ratings
- **Ratings:** User scores tied to items
- **Accounts/Sessions:** NextAuth OAuth persistence records

### Admin System
- Dashboard at `/admin` with overview metrics, rating charts, and recent activity
- Google OAuth sign-in with role-aware redirects
- Role-based access control for all admin routes
- Management interfaces for categories, ranking items, users, and ratings
- Live analytics sourced from JSON or SQLite (depending on deployment)

### Development Setup
1. Install dependencies with `npm install`
2. Configure `.env.local` using provided template (NextAuth + Google credentials)
3. Start locally with `npm run dev` or `docker compose --profile dev up nextjs-ranking-app-dev`
4. First run auto-bootstraps JSON data (`data/database.json`); optional SQLite bootstrap handled by `src/lib/database/sqlite.ts` when using Kysely
5. Sign in with Google and promote your account to `SUPER_ADMIN` via data file or SQLite editor as needed

### Project Structure Complete
- ✅ Next.js App Router with TypeScript
- ✅ Mantine UI component library integration
- ✅ tRPC API routers for all entities
- ✅ NextAuth.js authentication setup
- ✅ JSON repository data layer with optional Kysely/SQLite backend
- ✅ Docker development and production environments
- ✅ Admin dashboard UI components and analytics
- ✅ Environment variable validation (`src/env.ts`)
- ✅ Comprehensive documentation

This project demonstrates modern full-stack development practices with type safety, secure authentication, and a polished admin experience.