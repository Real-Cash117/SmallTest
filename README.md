# Ranking System - Next.js TypeScript Application

A full-stack ranking platform built with Next.js 14 (App Router), TypeScript, Mantine UI, and a JSON-backed data layer exposed through tRPC. It delivers a polished public rating experience plus an admin portal for managing categories, items, users, and ratings.

## Features

### Public
- ⭐ Rate items on a 1–10 scale with instant averages
- 📂 Browse items by category and featured highlights
- 📱 Responsive Mantine UI layout
- 🔔 Auth prompt when non-signed users attempt to rate

### Admin
- 🔐 Google OAuth via NextAuth.js with role checks (USER / ADMIN / SUPER_ADMIN)
- 🗂️ CRUD for categories, items, ratings, and user roles
- 📊 Dashboard analytics including rating charts and counts
- 🔔 Toast feedback for all mutations

## Tech Stack

- **Frontend:** Next.js 14, React 18, Mantine UI, @tanstack/react-query
- **Backend:** tRPC, NextAuth.js
- **Data Layer:** JSON flat file (`data/database.json`) accessed through a repository class
- **Validation:** Zod environment and input schemas
- **Tooling:** TypeScript, ESLint, Docker / Docker Compose

## Getting Started

1. Install dependencies  
   ```bash
   npm install
   ```

2. Configure environment variables  
   ```bash
   cp .env.example .env.local
   ```
   Update with your Google OAuth credentials and `NEXTAUTH_SECRET`.

3. Run the dev server  
   ```bash
   npm run dev
   ```

4. Seed data lives in `data/database.json`. Promote your account to `SUPER_ADMIN` by editing the JSON after first sign-in if needed.

### Docker

- Development: `docker compose --profile dev up nextjs-ranking-app-dev`
- Production preview: `docker compose up nextjs-ranking-app`
- Data file is mounted from `./data`.

## Project Structure

```
src/
├─ app/              # App Router pages (public + admin + auth)
├─ components/       # Shared UI (AuthProvider, etc.)
├─ lib/database/     # JSON repository implementation
├─ server/           # tRPC routers and NextAuth setup
├─ trpc/             # React query hooks
└─ env.ts            # Zod env validation
```

## Admin Workflow

1. Visit `/auth/signin` (Google OAuth).
2. Ensure your role is `ADMIN` or `SUPER_ADMIN`.
3. Manage content at `/admin`:
   - Categories & items CRUD
   - Ratings moderation and stats
   - User role adjustments
   - Dashboard metrics and charts

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run lint` – lint checks

## Notes

- JSON storage is ideal for quick demos; migrate to SQLite/Kysely for production-ready persistence.
- Maintain regular backups of `data/database.json`.
- Configure `NEXTAUTH_URL` and secrets before deploying.

## License

MIT License. Contributions welcome via pull requests.