# Ranking System - Next.js TypeScript Application

A production-ready ranking platform built with Next.js 14 (App Router), TypeScript, Mantine UI, and tRPC. The app ships with a JSON persistence layer (`data/database.json`) and offers an optional SQLite backend powered by Kysely.

## Features

### Public
- ⭐ 1–10 rating interface with live averages
- 📂 Category browsing and featured highlights
- 🔔 Auth prompt when anonymous users attempt to rate
- 📱 Responsive Mantine UI design

### Admin
- 🔐 Google OAuth via NextAuth.js with role checks (USER / ADMIN / SUPER_ADMIN)
- 🗂️ CRUD for categories, items, ratings, and user roles
- 📊 Dashboard metrics with rating charts
- 🔔 Toast feedback for all mutations

## Tech Stack

- **Frontend:** Next.js 14, React 18, Mantine UI, @tanstack/react-query
- **Backend:** tRPC, NextAuth.js, Zod validation
- **Persistence (default):** JSON flat file repository
- **Persistence (optional):** SQLite (`better-sqlite3`) accessed through Kysely
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
   Provide Google OAuth credentials and a secure `NEXTAUTH_SECRET`.

3. Run the dev server  
   ```bash
   npm run dev
   ```

4. Data lives in `data/database.json`. After first sign-in, promote your account to `SUPER_ADMIN` by editing the JSON or using the admin UI.

### Optional SQLite + Kysely Backend

- Install extra deps: `npm install better-sqlite3 kysely`
- Enable the Kysely repository (`src/lib/database/sqlite.ts`) and ensure `data/app.db` is writable
- Update imports where needed to swap from JSON repository to the Kysely client

### Docker

- Development (hot reload, port 3001):  
  `docker compose --profile dev up nextjs-ranking-app-dev`
- Production preview (port 3000):  
  `docker compose up nextjs-ranking-app`
- Persistent storage is mounted from `./data`

## Project Structure

```
src/
├─ app/              # App Router pages (public, admin, auth)
├─ components/       # Shared UI (AuthProvider, etc.)
├─ lib/database/     # JSON repository + optional Kysely client
├─ server/           # tRPC routers and NextAuth config
├─ trpc/             # React query hooks
└─ env.ts            # Zod-based env validation
```

## Admin Workflow

1. Visit `/auth/signin` and authenticate with Google
2. Ensure your role is `ADMIN` or `SUPER_ADMIN`
3. Manage content at `/admin`:
   - Categories and ranking items
   - Ratings moderation and item stats
   - User role updates
   - Dashboard analytics

## Scripts

- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – run compiled app
- `npm run lint` – lint checks

## Notes

- Keep regular backups of `data/database.json` (or `data/app.db` if using SQLite)
- Configure `NEXTAUTH_URL` and secrets before deploying
- Enable the Kysely layer for stronger querying and type safety when moving beyond JSON storage

## License

MIT License. Contributions are welcome via pull requests.