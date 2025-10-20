import path from 'path';
import Database from 'better-sqlite3';

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: Database.Database;

  private constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'app.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.bootstrap();
  }

  static getInstance(): SQLiteDatabase {
    if (!this.instance) this.instance = new SQLiteDatabase();
    return this.instance;
  }

  private bootstrap() {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        emailVerified TEXT,
        image TEXT,
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ranking_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT,
        averageRating REAL NOT NULL,
        totalRatings INTEGER NOT NULL,
        featured INTEGER NOT NULL,
        active INTEGER NOT NULL,
        "order" INTEGER NOT NULL,
        categoryId TEXT NOT NULL REFERENCES categories(id),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        value INTEGER NOT NULL,
        userId TEXT NOT NULL REFERENCES users(id),
        itemId TEXT NOT NULL REFERENCES ranking_items(id),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(userId, itemId)
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        UNIQUE(provider, providerAccountId)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT NOT NULL UNIQUE,
        userId TEXT NOT NULL REFERENCES users(id),
        expires TEXT NOT NULL
      );
    `;
    this.db.exec(schema);

    const count = this.db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
    if (count.c === 0) {
      const now = new Date().toISOString();
      const insertCat = this.db.prepare(`
        INSERT INTO categories (id, name, description, color, createdAt, updatedAt)
        VALUES (@id, @name, @description, @color, @createdAt, @updatedAt)
      `);
      insertCat.run({
        id: 'cat_movies',
        name: 'Movies',
        description: 'Rate your favorite movies from 1 to 10',
        color: 'blue',
        createdAt: now,
        updatedAt: now,
      });
      insertCat.run({
        id: 'cat_restaurants',
        name: 'Restaurants',
        description: "Rate restaurants you've visited",
        color: 'green',
        createdAt: now,
        updatedAt: now,
      });

      const insertItem = this.db.prepare(`
        INSERT INTO ranking_items (
          id, name, description, imageUrl, averageRating, totalRatings,
          featured, active, "order", categoryId, createdAt, updatedAt
        ) VALUES (@id, @name, @description, @imageUrl, @averageRating, @totalRatings,
          @featured, @active, @order, @categoryId, @createdAt, @updatedAt)
      `);
      insertItem.run({
        id: 'item_1',
        name: 'The Shawshank Redemption',
        description: 'A banker convicted of murdering his wife and her lover...',
        imageUrl: '',
        averageRating: 9.3,
        totalRatings: 12,
        featured: 1,
        active: 1,
        order: 1,
        categoryId: 'cat_movies',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  private generateId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  // Users
  getAllUsers() {
    return this.db.prepare('SELECT * FROM users').all();
  }

  findUserByEmail(email: string) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) ?? null;
  }

  findUserById(id: string) {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) ?? null;
  }

  createUser(data: { email: string; name?: string; image?: string; role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' }) {
    const id = this.generateId('user');
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO users (id, name, email, emailVerified, image, role, createdAt, updatedAt)
         VALUES (@id, @name, @email, NULL, @image, @role, @createdAt, @updatedAt)`
      )
      .run({ id, name: data.name ?? null, email: data.email, image: data.image ?? null, role: data.role, createdAt: now, updatedAt: now });
    return this.findUserById(id);
  }

  updateUser(id: string, updates: Partial<{ name: string; image: string; role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' }>) {
    const now = new Date().toISOString();
    const existing = this.findUserById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: now };
    this.db
      .prepare(
        `UPDATE users SET name=@name, image=@image, role=@role, updatedAt=@updatedAt WHERE id=@id`
      )
      .run({
        id,
        name: merged.name ?? null,
        image: merged.image ?? null,
        role: merged.role,
        updatedAt: merged.updatedAt,
      });
    return this.findUserById(id);
  }

  getUserStats() {
    const total = this.db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
    const admins = this.db
      .prepare("SELECT COUNT(*) as c FROM users WHERE role IN ('ADMIN','SUPER_ADMIN')")
      .get() as { c: number };
    return { totalUsers: total.c, admins: admins.c };
  }

  // Categories
  getAllCategories() {
    return this.db
      .prepare(
        `SELECT c.*, IFNULL(cnt.total,0) as itemCount
         FROM categories c
         LEFT JOIN (
           SELECT categoryId, COUNT(*) as total
           FROM ranking_items
           GROUP BY categoryId
         ) cnt ON cnt.categoryId = c.id`
      )
      .all()
      .map((row) => ({
        ...row,
        _count: { items: row.itemCount },
      }));
  }

  createCategory(data: { name: string; description?: string; color: string }) {
    const id = this.generateId('cat');
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO categories (id, name, description, color, createdAt, updatedAt)
         VALUES (@id, @name, @description, @color, @createdAt, @updatedAt)`
      )
      .run({
        id,
        name: data.name,
        description: data.description ?? null,
        color: data.color,
        createdAt: now,
        updatedAt: now,
      });
    return this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  updateCategory(id: string, updates: Partial<{ name: string; description?: string; color: string }>) {
    const existing = this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const merged = { ...existing, ...updates, updatedAt: now };
    this.db
      .prepare(
        `UPDATE categories
         SET name=@name, description=@description, color=@color, updatedAt=@updatedAt
         WHERE id=@id`
      )
      .run({
        id,
        name: merged.name,
        description: merged.description ?? null,
        color: merged.color,
        updatedAt: merged.updatedAt,
      });
    return this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  deleteCategory(id: string) {
    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM ratings WHERE itemId IN (SELECT id FROM ranking_items WHERE categoryId = ?)').run(id);
      this.db.prepare('DELETE FROM ranking_items WHERE categoryId = ?').run(id);
      const res = this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
      return res.changes > 0;
    });
    return { success: tx() };
  }

  // Items
  getAllItems() {
    return this.db
      .prepare('SELECT * FROM ranking_items ORDER BY "order" ASC')
      .all();
  }

  getItemsByCategory(categoryId: string) {
    return this.db
      .prepare(
        `SELECT * FROM ranking_items
         WHERE categoryId = ? AND active = 1
         ORDER BY averageRating DESC, "order" ASC`
      )
      .all(categoryId);
  }

  getFeaturedItems() {
    return this.db
      .prepare('SELECT * FROM ranking_items WHERE featured = 1 AND active = 1 ORDER BY "order" ASC')
      .all();
  }

  createRankingItem(data: {
    name: string;
    description: string;
    imageUrl?: string;
    featured: boolean;
    active: boolean;
    order: number;
    categoryId: string;
  }) {
    const id = this.generateId('item');
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO ranking_items (
          id, name, description, imageUrl, averageRating, totalRatings,
          featured, active, "order", categoryId, createdAt, updatedAt
        ) VALUES (@id, @name, @description, @imageUrl, 0, 0, @featured, @active,
          @order, @categoryId, @createdAt, @updatedAt)`
      )
      .run({
        id,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        featured: data.featured ? 1 : 0,
        active: data.active ? 1 : 0,
        order: data.order,
        categoryId: data.categoryId,
        createdAt: now,
        updatedAt: now,
      });
    return this.db.prepare('SELECT * FROM ranking_items WHERE id = ?').get(id);
  }

  updateRankingItem(id: string, updates: Partial<{
    name: string;
    description: string;
    imageUrl?: string;
    featured: boolean;
    active: boolean;
    order: number;
    categoryId: string;
  }>) {
    const existing = this.db.prepare('SELECT * FROM ranking_items WHERE id = ?').get(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const merged = {
      ...existing,
      ...updates,
      featured: updates.featured ?? Boolean(existing.featured),
      active: updates.active ?? Boolean(existing.active),
      updatedAt: now,
    };
    this.db
      .prepare(
        `UPDATE ranking_items
         SET name=@name, description=@description, imageUrl=@imageUrl,
             featured=@featured, active=@active, "order"=@order,
             categoryId=@categoryId, updatedAt=@updatedAt
         WHERE id=@id`
      )
      .run({
        id,
        name: merged.name,
        description: merged.description,
        imageUrl: merged.imageUrl ?? null,
        featured: merged.featured ? 1 : 0,
        active: merged.active ? 1 : 0,
        order: merged.order,
        categoryId: merged.categoryId,
        updatedAt: merged.updatedAt,
      });
    return this.db.prepare('SELECT * FROM ranking_items WHERE id = ?').get(id);
  }

  deleteRankingItem(id: string) {
    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM ratings WHERE itemId = ?').run(id);
      const res = this.db.prepare('DELETE FROM ranking_items WHERE id = ?').run(id);
      return res.changes > 0;
    });
    return { success: tx() };
  }

  getItemStats() {
    const total = this.db.prepare('SELECT COUNT(*) as c FROM ranking_items').get() as { c: number };
    const active = this.db.prepare('SELECT COUNT(*) as c FROM ranking_items WHERE active = 1').get() as { c: number };
    return { totalItems: total.c, activeItems: active.c };
  }

  // Ratings
  private recalcItem(itemId: string) {
    const agg = this.db
      .prepare(
        `SELECT COUNT(*) as total, IFNULL(AVG(value),0) as avg
         FROM ratings WHERE itemId = ?`
      )
      .get(itemId) as { total: number; avg: number };
    this.db
      .prepare(
        `UPDATE ranking_items
         SET averageRating = ROUND(@avg, 1), totalRatings = @total, updatedAt = @updatedAt
         WHERE id = @id`
      )
      .run({ id: itemId, avg: agg.avg, total: agg.total, updatedAt: new Date().toISOString() });
  }

  createRating(data: { userId: string; itemId: string; value: number }) {
    const now = new Date().toISOString();
    const upsert = this.db.prepare(`
      INSERT INTO ratings (id, userId, itemId, value, createdAt, updatedAt)
      VALUES (@id, @userId, @itemId, @value, @createdAt, @updatedAt)
      ON CONFLICT(userId, itemId) DO UPDATE SET
        value=excluded.value,
        updatedAt=excluded.updatedAt
      RETURNING *
    `);
    const rating = upsert.get({
      id: this.generateId('rating'),
      userId: data.userId,
      itemId: data.itemId,
      value: data.value,
      createdAt: now,
      updatedAt: now,
    }) as any;
    this.recalcItem(data.itemId);
    return rating;
  }

  getAllRatings() {
    return this.db
      .prepare(
        `SELECT r.*, u.name as userName, u.email as userEmail, i.name as itemName
         FROM ratings r
         LEFT JOIN users u ON u.id = r.userId
         LEFT JOIN ranking_items i ON i.id = r.itemId
         ORDER BY r.updatedAt DESC`
      )
      .all()
      .map((row) => ({
        id: row.id,
        value: row.value,
        userId: row.userId,
        itemId: row.itemId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: row.userId ? { id: row.userId, name: row.userName, email: row.userEmail } : undefined,
        item: row.itemId ? { id: row.itemId, name: row.itemName } : undefined,
      }));
  }

  updateRating(id: string, value: number) {
    const rating = this.db.prepare('SELECT * FROM ratings WHERE id = ?').get(id);
    if (!rating) return null;
    const now = new Date().toISOString();
    this.db
      .prepare('UPDATE ratings SET value=@value, updatedAt=@updatedAt WHERE id=@id')
      .run({ id, value, updatedAt: now });
    this.recalcItem(rating.itemId);
    return this.db.prepare('SELECT * FROM ratings WHERE id = ?').get(id);
  }

  deleteRating(id: string) {
    const rating = this.db.prepare('SELECT * FROM ratings WHERE id = ?').get(id);
    if (!rating) return { success: false };
    this.db.prepare('DELETE FROM ratings WHERE id = ?').run(id);
    this.recalcItem(rating.itemId);
    return { success: true };
  }

  getRatingStats() {
    const stats = this.db
      .prepare('SELECT COUNT(*) as total, IFNULL(AVG(value),0) as avg FROM ratings')
      .get() as { total: number; avg: number };
    const unique = this.db
      .prepare('SELECT COUNT(DISTINCT userId) as total FROM ratings')
      .get() as { total: number };
    return {
      totalRatings: stats.total,
      averageRating: Math.round(stats.avg * 10) / 10,
      uniqueRaters: unique.total,
    };
  }

  // Accounts & Sessions for NextAuth
  findAccount(provider: string, providerAccountId: string) {
    return this.db
      .prepare('SELECT * FROM accounts WHERE provider = ? AND providerAccountId = ?')
      .get(provider, providerAccountId) ?? null;
  }

  createAccount(data: Omit<Account, 'id'>) {
    const id = this.generateId('acc');
    this.db
      .prepare(
        `INSERT INTO accounts (
          id, userId, type, provider, providerAccountId,
          refresh_token, access_token, expires_at, token_type,
          scope, id_token, session_state
        ) VALUES (@id, @userId, @type, @provider, @providerAccountId,
          @refresh_token, @access_token, @expires_at, @token_type,
          @scope, @id_token, @session_state)`
      )
      .run({ id, ...data });
    return this.db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
  }

  findSession(sessionToken: string) {
    return this.db.prepare('SELECT * FROM sessions WHERE sessionToken = ?').get(sessionToken) ?? null;
  }

  createSession(data: Omit<Session, 'id'>) {
    const id = this.generateId('sess');
    this.db
      .prepare(
        `INSERT INTO sessions (id, sessionToken, userId, expires)
         VALUES (@id, @sessionToken, @userId, @expires)`
      )
      .run({ id, ...data });
    return this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  }

  updateSession(sessionToken: string, updates: Partial<Session>) {
    const existing = this.findSession(sessionToken);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    this.db
      .prepare('UPDATE sessions SET userId=@userId, expires=@expires WHERE sessionToken=@sessionToken')
      .run({
        sessionToken,
        userId: merged.userId,
        expires: merged.expires,
      });
    return this.findSession(sessionToken);
  }

  deleteSession(sessionToken: string) {
    this.db.prepare('DELETE FROM sessions WHERE sessionToken = ?').run(sessionToken);
  }
}

export const db = SQLiteDatabase.getInstance();