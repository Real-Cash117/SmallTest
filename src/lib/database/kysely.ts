import path from 'path';
import Database from 'better-sqlite3';
import { Generated, Kysely, SqliteDialect } from 'kysely';

interface UsersTable {
  id: Generated<string>;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface CategoriesTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface RankingItemsTable {
  id: Generated<string>;
  name: string;
  description: string;
  imageUrl: string | null;
  averageRating: number;
  totalRatings: number;
  featured: number;
  active: number;
  order: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface RatingsTable {
  id: Generated<string>;
  value: number;
  userId: string;
  itemId: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountsTable {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

interface SessionsTable {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: string;
}

export interface AppDatabase {
  users: UsersTable;
  categories: CategoriesTable;
  ranking_items: RankingItemsTable;
  ratings: RatingsTable;
  accounts: AccountsTable;
  sessions: SessionsTable;
}

const sqlite = new SqliteDialect({
  database: new Database(path.join(process.cwd(), 'data', 'app.db')),
});

export const kysely = new Kysely<AppDatabase>({
  dialect: sqlite,
});