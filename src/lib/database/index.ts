import fs from 'fs/promises';
import path from 'path';

// Types for your completed ranking application
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankingItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  averageRating: number;
  totalRatings: number;
  featured: boolean;
  active: boolean;
  order: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  value: number;
  userId: string;
  itemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
}

interface Database {
  users: User[];
  categories: Category[];
  rankingItems: RankingItem[];
  ratings: Rating[];
  accounts: Account[];
  sessions: Session[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

export class JSONDatabase {
  private static instance: JSONDatabase;
  private data: Database | null = null;

  static getInstance(): JSONDatabase {
    if (!this.instance) {
      this.instance = new JSONDatabase();
    }
    return this.instance;
  }

  private async initDatabase(): Promise<Database> {
    try {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      const initialData: Database = {
        users: [],
        categories: [
          {
            id: 'cat_movies',
            name: 'Movies',
            description: 'Rate your favorite movies from 1 to 10',
            color: 'blue',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'cat_restaurants',
            name: 'Restaurants',
            description: 'Rate restaurants you\'ve visited',
            color: 'green',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        rankingItems: [
          {
            id: 'item_1',
            name: 'The Shawshank Redemption',
            description: 'A banker convicted of murdering his wife and her lover...',
            imageUrl: '',
            averageRating: 9.3,
            totalRatings: 12,
            featured: true,
            active: true,
            order: 1,
            categoryId: 'cat_movies',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        ratings: [],
        accounts: [],
        sessions: []
      };
      await this.saveDatabase(initialData);
      return initialData;
    }
  }

  private async saveDatabase(data: Database): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  private async getData(): Promise<Database> {
    if (!this.data) {
      this.data = await this.initDatabase();
    }
    return this.data;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // User operations for your admin system
  async getAllUsers(): Promise<User[]> {
    const db = await this.getData();
    return [...db.users];
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const db = await this.getData();
    return db.users.find(u => u.email === email) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const db = await this.getData();
    return db.users.find(u => u.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await this.getData();
    const user: User = {
      ...userData,
      id: this.generateId('user'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
    this.data = db;
    await this.saveDatabase(db);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const db = await this.getData();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    db.users[userIndex] = { ...db.users[userIndex], ...updates, updatedAt: new Date().toISOString() };
    this.data = db;
    await this.saveDatabase(db);
    return db.users[userIndex];
  }

  // Category operations for your ranking system
  async getAllCategories(): Promise<(Category & { _count: { items: number } })[]> {
    const db = await this.getData();
    return db.categories.map(cat => ({
      ...cat,
      _count: {
        items: db.rankingItems.filter(item => item.categoryId === cat.id).length
      }
    }));
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const db = await this.getData();
    const category: Category = {
      ...categoryData,
      id: this.generateId('cat'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.categories.push(category);
    this.data = db;
    await this.saveDatabase(db);
    return category;
  }
  
  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "createdAt">>,
  ): Promise<Category | null> {
    const db = await this.getData();
    const index = db.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return null;

    db.categories[index] = {
      ...db.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data = db;
    await this.saveDatabase(db);
    return db.categories[index];
  }
  
  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const db = await this.getData();
    const exists = db.categories.some((cat) => cat.id === id);
    if (!exists) return { success: false };

    const removedItemIds = db.rankingItems
      .filter((item) => item.categoryId === id)
      .map((item) => item.id);

    db.categories = db.categories.filter((cat) => cat.id !== id);
    db.rankingItems = db.rankingItems.filter((item) => item.categoryId !== id);
    db.ratings = db.ratings.filter((rating) => !removedItemIds.includes(rating.itemId));

    this.data = db;
    await this.saveDatabase(db);
    return { success: true };
  }

  // Stats for your admin dashboard
  async getUserStats(): Promise<{ totalUsers: number; admins: number }> {
    const db = await this.getData();
    return {
      totalUsers: db.users.length,
      admins: db.users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length
    };
  }
  
  async getAllItems(): Promise<RankingItem[]> {
    const db = await this.getData();
    return [...db.rankingItems].sort((a, b) => a.order - b.order);
  }
  
  async createRankingItem(
    itemData: Omit<RankingItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<RankingItem> {
    const db = await this.getData();
    const item: RankingItem = {
      ...itemData,
      id: this.generateId("item"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.rankingItems.push(item);
    this.data = db;
    await this.saveDatabase(db);
    return item;
  }

  async updateRankingItem(
    id: string,
    updates: Partial<Omit<RankingItem, "id" | "createdAt">>,
  ): Promise<RankingItem | null> {
    const db = await this.getData();
    const index = db.rankingItems.findIndex((item) => item.id === id);
    if (index === -1) return null;

    db.rankingItems[index] = {
      ...db.rankingItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data = db;
    await this.saveDatabase(db);
    return db.rankingItems[index];
  }
  
  async deleteRankingItem(id: string): Promise<{ success: boolean }> {
    const db = await this.getData();
    const exists = db.rankingItems.some((item) => item.id === id);
    if (!exists) return { success: false };

    db.rankingItems = db.rankingItems.filter((item) => item.id !== id);
    db.ratings = db.ratings.filter((rating) => rating.itemId !== id);

    this.data = db;
    await this.saveDatabase(db);
    return { success: true };
  }
  
  async getFeaturedItems(): Promise<RankingItem[]> {
    const db = await this.getData();
    return db.rankingItems.filter((item) => item.featured && item.active);
  }
  
  async getItemsByCategory(categoryId: string): Promise<RankingItem[]> {
    const db = await this.getData();
    return db.rankingItems
      .filter((item) => item.categoryId === categoryId && item.active)
      .sort((a, b) => b.averageRating - a.averageRating || a.order - b.order);
  }

  async getItemStats(): Promise<{ totalItems: number; activeItems: number }> {
    const db = await this.getData();
    return {
      totalItems: db.rankingItems.length,
      activeItems: db.rankingItems.filter(item => item.active).length
    };
  }
  
  private recalculateItemMetrics(db: Database, itemId: string): void {
    const itemIndex = db.rankingItems.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const itemRatings = db.ratings.filter((rating) => rating.itemId === itemId);
    const totalRatings = itemRatings.length;
    const sum = itemRatings.reduce((acc, rating) => acc + rating.value, 0);
    const averageRating =
      totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

    db.rankingItems[itemIndex] = {
      ...db.rankingItems[itemIndex],
      averageRating,
      totalRatings,
      updatedAt: new Date().toISOString(),
    };
  }
  
  async createRating(
    ratingData: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Rating> {
    const db = await this.getData();

    const existingRating = db.ratings.find(
      (r) => r.userId === ratingData.userId && r.itemId === ratingData.itemId,
    );
    if (existingRating) {
      existingRating.value = ratingData.value;
      existingRating.updatedAt = new Date().toISOString();
      this.recalculateItemMetrics(db, ratingData.itemId);

      this.data = db;
      await this.saveDatabase(db);
      return existingRating;
    }

    const rating: Rating = {
      ...ratingData,
      id: this.generateId('rating'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.ratings.push(rating);
    this.recalculateItemMetrics(db, ratingData.itemId);

    this.data = db;
    await this.saveDatabase(db);
    return rating;
  }
  
  async getAllRatings(): Promise<(Rating & { user?: User; item?: RankingItem })[]> {
    const db = await this.getData();
    return db.ratings
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .map((rating) => ({
        ...rating,
        user: db.users.find((user) => user.id === rating.userId),
        item: db.rankingItems.find((item) => item.id === rating.itemId),
      }));
  }

  async updateRating(id: string, value: number): Promise<Rating | null> {
    const db = await this.getData();
    const ratingIndex = db.ratings.findIndex((rating) => rating.id === id);
    if (ratingIndex === -1) return null;

    db.ratings[ratingIndex] = {
      ...db.ratings[ratingIndex],
      value,
      updatedAt: new Date().toISOString(),
    };

    this.recalculateItemMetrics(db, db.ratings[ratingIndex].itemId);

    this.data = db;
    await this.saveDatabase(db);
    return db.ratings[ratingIndex];
  }

  async deleteRating(id: string): Promise<{ success: boolean }> {
    const db = await this.getData();
    const rating = db.ratings.find((r) => r.id === id);
    if (!rating) return { success: false };

    db.ratings = db.ratings.filter((r) => r.id !== id);
    this.recalculateItemMetrics(db, rating.itemId);

    this.data = db;
    await this.saveDatabase(db);
    return { success: true };
  }

  async getRatingStats(): Promise<{
    totalRatings: number;
    averageRating: number;
    uniqueRaters: number;
  }> {
    const db = await this.getData();
    const totalRatings = db.ratings.length;
    const sum = db.ratings.reduce((acc, rating) => acc + rating.value, 0);
    const averageRating =
      totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;
    const uniqueRaters = new Set(db.ratings.map((rating) => rating.userId)).size;

    return { totalRatings, averageRating, uniqueRaters };
  }

  // NextAuth.js support for your admin authentication
  async findAccount(provider: string, providerAccountId: string): Promise<Account | null> {
    const db = await this.getData();
    return db.accounts.find(a => a.provider === provider && a.providerAccountId === providerAccountId) || null;
  }

  async createAccount(accountData: Omit<Account, 'id'>): Promise<Account> {
    const db = await this.getData();
    const account: Account = {
      ...accountData,
      id: this.generateId('acc')
    };
    db.accounts.push(account);
    this.data = db;
    await this.saveDatabase(db);
    return account;
  }

  async findSession(sessionToken: string): Promise<Session | null> {
    const db = await this.getData();
    return db.sessions.find(s => s.sessionToken === sessionToken) || null;
  }

  async createSession(sessionData: Omit<Session, 'id'>): Promise<Session> {
    const db = await this.getData();
    const session: Session = {
      ...sessionData,
      id: this.generateId('sess')
    };
    db.sessions.push(session);
    this.data = db;
    await this.saveDatabase(db);
    return session;
  }

  async updateSession(sessionToken: string, updates: Partial<Session>): Promise<Session | null> {
    const db = await this.getData();
    const sessionIndex = db.sessions.findIndex(s => s.sessionToken === sessionToken);
    if (sessionIndex === -1) return null;
    
    db.sessions[sessionIndex] = { ...db.sessions[sessionIndex], ...updates };
    this.data = db;
    await this.saveDatabase(db);
    return db.sessions[sessionIndex];
  }

  async deleteSession(sessionToken: string): Promise<void> {
    const db = await this.getData();
    db.sessions = db.sessions.filter(s => s.sessionToken !== sessionToken);
    this.data = db;
    await this.saveDatabase(db);
  }
}