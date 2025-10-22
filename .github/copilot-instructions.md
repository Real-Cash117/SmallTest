# Ranking System - Full-Stack Admin Project

This project is a completed Next.js TypeScript ranking application featuring a comprehensive admin dashboard and JSON-backed persistence.

## Project Overview
- **Status:** ✅ Completed – production-ready full-stack implementation
- **Frontend:** Next.js 14 App Router, TypeScript, Mantine UI
- **Backend:** tRPC for type-safe APIs with JSON repository
- **Database:** File-based JSON storage (`data/database.json`)
- **Authentication:** NextAuth.js (Google OAuth)
- **Infrastructure:** Docker Compose for development and production

## Key Features Implemented
- ⭐ Public 1–10 star ranking interface
- 🔐 Secure Google OAuth authentication and role checks
- 📊 Admin dashboard with charts and statistics
- 🏷️ Category and ranking item management workflows
- 👥 User role management (USER / ADMIN / SUPER_ADMIN)
- 📝 Ratings moderation with instant aggregate recalculation
- 🐳 Dockerized dev/prod environments

## Data Schema
- `users` – auth profiles with roles
- `categories` – themed collections
- `rankingItems` – rateable entities and aggregates
- `ratings` – user scores
- `accounts`, `sessions` – NextAuth persistence objects

## Admin System
- Dashboard at `/admin` with live metrics
- Role-based access control for all admin routes
- Management views for categories, items, ratings, and users
- Toast notifications on all mutations

## Development Setup
1. Configure `.env.local` using `.env.example`
2. Install dependencies via `npm install`
3. Run `npm run dev` (or Docker Compose)
4. JSON database seeds populate on first run
5. Promote newly created accounts to `SUPER_ADMIN` within the data file if needed

## Project Structure Complete
- ✅ Next.js 14 App Router + TypeScript
- ✅ Mantine UI component system
- ✅ tRPC routers for all entities
- ✅ NextAuth.js Google OAuth integration
- ✅ JSON repository data layer with aggregation helpers
- ✅ Docker Compose dev/prod workflows
- ✅ Admin dashboard and statistics UI
- ✅ Environment variable validation and documentation