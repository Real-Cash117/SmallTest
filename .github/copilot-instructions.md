# Ranking System - Full-Stack Admin Project

This is a comprehensive Next.js TypeScript ranking application with a complete admin system.

## Project Overview

**Status: ✅ COMPLETED** – Full-stack ranking application with admin dashboard

### Architecture
- **Frontend**: Next.js 14 App Router, TypeScript, Mantine UI
- **Backend**: tRPC for type-safe APIs, custom SQLite data layer
- **Database**: SQLite (`better-sqlite3`) with bootstrap schema in code
- **Authentication**: NextAuth.js with Google OAuth
- **Infrastructure**: Docker Compose with development/production environments

### Key Features Implemented
- ⭐ Public ranking interface with 1–10 star ratings
- 🔐 Secure admin authentication system
- 📊 Admin dashboard with real-time statistics
- 🏷️ Category and item management
- 👥 User role management (USER / ADMIN / SUPER_ADMIN)
- 🐳 Full Docker containerization
- 📝 Complete CRUD operations via tRPC

### Database Schema
- **Users**: Authentication with role-based access
- **Categories**: Thematic organization for ranking items
- **RankingItems**: Core entities with metadata and aggregated ratings
- **Ratings**: User scores tied to items
- **Accounts/Sessions**: NextAuth OAuth persistence

### Admin System
- Dashboard at `/admin` with overview metrics and charts
- Google OAuth sign-in with role-aware redirects
- Role-based access control for all admin routes
- Management interfaces for items, categories, users, and ratings
- Live analytics sourced from SQLite

### Development Setup
1. Configure `.env.local` with NextAuth and Google credentials
2. Run `npm install` (uses lockfile for deterministic deps)
3. Start locally with `npm run dev` or via Docker Compose (`nextjs-ranking-app-dev` profile)
4. First run auto-bootstraps SQLite schema and seed data in `data/app.db`
5. Sign in with Google and promote your account to `SUPER_ADMIN` via DB editor if needed

### Project Structure Complete
- ✅ Next.js App Router with TypeScript
- ✅ Mantine UI component library integration
- ✅ SQLite-backed data layer (no Prisma dependency)
- ✅ tRPC API routers for all entities
- ✅ NextAuth.js authentication setup
- ✅ Docker development and production environments
- ✅ Admin dashboard UI components
- ✅ Environment variable validation (`src/env.ts`)
- ✅ Comprehensive documentation

This project demonstrates modern full-stack development practices with type safety, secure authentication, and a polished admin experience.