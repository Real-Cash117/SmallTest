import { randomUUID } from 'crypto';
import { sql } from 'kysely';
import { kysely } from './kysely';
import type {
  Account,
  Category,
  RankingItem,
  Rating,
  Session,
  User,
} from './index';

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private initPromise: Promise<void>;

  private constructor() {
    this.initPromise = this.bootstrap();
  }

  static getInstance(): SQLiteDatabase {
    if (!this.instance) this.instance = new SQLiteDatabase();
    return this.instance;
  }

  private async bootstrap() {
    await sql`PRAGMA journal_mode = WAL`.execute(kysely);

    await kysely.schema
      .createTable('users')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('name', 'text')
      .addColumn('email', 'text', (col) => col.notNull().unique())
      .addColumn('emailVerified', 'text')
      .addColumn('image', 'text')
      .addColumn('role', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) => col.notNull())
      .addColumn('updatedAt', 'text', (col) => col.notNull())
      .execute();

    await kysely.schema
      .createTable('categories')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('color', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) => col.notNull())
      .addColumn('updatedAt', 'text', (col) => col.notNull())
      .execute();

    await kysely.schema
      .createTable('ranking_items')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('description', 'text', (col) => col.notNull())
      .addColumn('imageUrl', 'text')
      .addColumn('averageRating', 'real', (col) => col.notNull())
      .addColumn('totalRatings', 'integer', (col) => col.notNull())
      .addColumn('featured', 'integer', (col) => col.notNull())
      .addColumn('active', 'integer', (col) => col.notNull())
      .addColumn('order', 'integer', (col) => col.notNull())
      .addColumn('categoryId', 'text', (col) =>
        col.notNull().references('categories.id'),
      )
      .addColumn('createdAt', 'text', (col) => col.notNull())
      .addColumn('updatedAt', 'text', (col) => col.notNull())
      .execute();

    await kysely.schema
      .createTable('ratings')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('value', 'integer', (col) => col.notNull())
      .addColumn('userId', 'text', (col) =>
        col.notNull().references('users.id'),
      )
      .addColumn('itemId', 'text', (col) =>
        col.notNull().references('ranking_items.id'),
      )
      .addColumn('createdAt', 'text', (col) => col.notNull())
      .addColumn('updatedAt', 'text', (col) => col.notNull())
      .addUniqueConstraint('ratings_user_item_unique', ['userId', 'itemId'])
      .execute();

    await kysely.schema
      .createTable('accounts')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('userId', 'text', (col) =>
        col.notNull().references('users.id'),
      )
      .addColumn('type', 'text', (col) => col.notNull())
      .addColumn('provider', 'text', (col) => col.notNull())
      .addColumn('providerAccountId', 'text', (col) => col.notNull())
      .addColumn('refresh_token', 'text')
      .addColumn('access_token', 'text')
      .addColumn('expires_at', 'integer')
      .addColumn('token_type', 'text')
      .addColumn('scope', 'text')
      .addColumn('id_token', 'text')
      .addColumn('session_state', 'text')
      .addUniqueConstraint('accounts_provider_unique', [
        'provider',
        'providerAccountId',
      ])
      .execute();

    await kysely.schema
      .createTable('sessions')
      .ifNotExists()
      .addColumn('id', 'text', (col) => col.primaryKey())
      .addColumn('sessionToken', 'text', (col) => col.notNull().unique())
      .addColumn('userId', 'text', (col) =>
        col.notNull().references('users.id'),
      )
      .addColumn('expires', 'text', (col) => col.notNull())
      .execute();

    const seeded = await kysely
      .selectFrom('categories')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();

    const alreadySeeded = Number(seeded?.count ?? 0) > 0;
    if (!alreadySeeded) {
      const now = new Date().toISOString();
      await kysely
        .insertInto('categories')
        .values([
          {
            id: 'cat_movies',
            name: 'Movies',
            description: 'Rate your favorite movies from 1 to 10',
            color: 'blue',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'cat_restaurants',
            name: 'Restaurants',
            description: "Rate restaurants you've visited",
            color: 'green',
            createdAt: now,
            updatedAt: now,
          },
        ])
        .execute();

      await kysely
        .insertInto('ranking_items')
        .values({
          id: 'item_1',
          name: 'The Shawshank Redemption',
          description:
            'A banker convicted of murdering his wife and her lover...',
          imageUrl: '',
          averageRating: 9.3,
          totalRatings: 12,
          featured: 1,
          active: 1,
          order: 1,
          categoryId: 'cat_movies',
          createdAt: now,
          updatedAt: now,
        })
        .execute();
    }
  }

  private async ensureReady() {
    await this.initPromise;
  }

  private generateId(prefix: string) {
    return `${prefix}_${randomUUID()}`;
  }

  // Users -------------------------------------------------------------------

  async getAllUsers(): Promise<User[]> {
    await this.ensureReady();
    return await kysely.selectFrom('users').selectAll().execute();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.ensureReady();
    return (
      (await kysely
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst()) ?? null
    );
  }

  async findUserById(id: string): Promise<User | null> {
    await this.ensureReady();
    return (
      (await kysely
        .selectFrom('users')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()) ?? null
    );
  }

  async createUser(data: {
    email: string;
    name?: string;
    image?: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  }): Promise<User> {
    await this.ensureReady();
    const id = this.generateId('user');
    const now = new Date().toISOString();

    await kysely
      .insertInto('users')
      .values({
        id,
        email: data.email,
        name: data.name ?? null,
        image: data.image ?? null,
        emailVerified: null,
        role: data.role,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return (await this.findUserById(id))!;
  }

  async updateUser(
    id: string,
    updates: Partial<{
      name: string;
      image: string;
      role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    }>,
  ): Promise<User | null> {
    await this.ensureReady();
    const existing = await this.findUserById(id);
    if (!existing) return null;

    await kysely
      .updateTable('users')
      .set({
        name: updates.name ?? existing.name ?? null,
        image: updates.image ?? existing.image ?? null,
        role: updates.role ?? existing.role,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();

    return await this.findUserById(id);
  }

  async getUserStats(): Promise<{ totalUsers: number; admins: number }> {
    await this.ensureReady();
    const total = await kysely
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();
    const admins = await kysely
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('role', 'in', ['ADMIN', 'SUPER_ADMIN'])
      .executeTakeFirst();

    return {
      totalUsers: Number(total?.count ?? 0),
      admins: Number(admins?.count ?? 0),
    };
  }

  // Categories --------------------------------------------------------------

  async getAllCategories(): Promise<(Category & { _count: { items: number } })[]> {
    await this.ensureReady();

    const rows = await kysely
      .selectFrom('categories as c')
      .leftJoin(
        kysely
          .selectFrom('ranking_items')
          .select('categoryId')
          .select((eb) => eb.fn.countAll().as('total'))
          .groupBy('categoryId')
          .as('cnt'),
        'cnt.categoryId',
        'c.id',
      )
      .selectAll('c')
      .select((eb) => eb.fn.coalesce('cnt.total', eb.val(0)).as('itemCount'))
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: { items: Number(row.itemCount ?? 0) },
    }));
  }

  async createCategory(data: {
    name: string;
    description?: string;
    color: string;
  }): Promise<Category> {
    await this.ensureReady();
    const id = this.generateId('cat');
    const now = new Date().toISOString();

    await kysely
      .insertInto('categories')
      .values({
        id,
        name: data.name,
        description: data.description ?? null,
        color: data.color,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return (await kysely
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst())!;
  }

  async updateCategory(
    id: string,
    updates: Partial<{ name: string; description?: string; color: string }>,
  ): Promise<Category | null> {
    await this.ensureReady();
    const existing = await kysely
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    if (!existing) return null;

    await kysely
      .updateTable('categories')
      .set({
        name: updates.name ?? existing.name,
        description:
          updates.description !== undefined
            ? updates.description
            : existing.description,
        color: updates.color ?? existing.color,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();

    return await kysely
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    await this.ensureReady();
    const success = await kysely.transaction().execute(async (trx) => {
      await trx
        .deleteFrom('ratings')
        .where('itemId', 'in', (eb) =>
          eb.selectFrom('ranking_items').select('id').where('categoryId', '=', id),
        )
        .execute();

      await trx
        .deleteFrom('ranking_items')
        .where('categoryId', '=', id)
        .execute();

      const result = await trx
        .deleteFrom('categories')
        .where('id', '=', id)
        .executeTakeFirst();

      return Number(result.numDeletedRows ?? 0) > 0;
    });

    return { success };
  }

  // Ranking Items -----------------------------------------------------------

  async getAllItems(): Promise<RankingItem[]> {
    await this.ensureReady();
    return await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .orderBy('order', 'asc')
      .execute();
  }

  async getItemsByCategory(categoryId: string): Promise<RankingItem[]> {
    await this.ensureReady();
    return await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .where('categoryId', '=', categoryId)
      .where('active', '=', 1)
      .orderBy('averageRating', 'desc')
      .orderBy('order', 'asc')
      .execute();
  }

  async getFeaturedItems(): Promise<RankingItem[]> {
    await this.ensureReady();
    return await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .where('featured', '=', 1)
      .where('active', '=', 1)
      .orderBy('order', 'asc')
      .execute();
  }

  async createRankingItem(data: {
    name: string;
    description: string;
    imageUrl?: string;
    featured: boolean;
    active: boolean;
    order: number;
    categoryId: string;
  }): Promise<RankingItem> {
    await this.ensureReady();
    const id = this.generateId('item');
    const now = new Date().toISOString();

    await kysely
      .insertInto('ranking_items')
      .values({
        id,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        averageRating: 0,
        totalRatings: 0,
        featured: data.featured ? 1 : 0,
        active: data.active ? 1 : 0,
        order: data.order,
        categoryId: data.categoryId,
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    return (await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst())!;
  }

  async updateRankingItem(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      imageUrl?: string;
      featured: boolean;
      active: boolean;
      order: number;
      categoryId: string;
    }>,
  ): Promise<RankingItem | null> {
    await this.ensureReady();
    const existing = await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    if (!existing) return null;

    await kysely
      .updateTable('ranking_items')
      .set({
        name: updates.name ?? existing.name,
        description: updates.description ?? existing.description,
        imageUrl:
          updates.imageUrl !== undefined
            ? updates.imageUrl
            : existing.imageUrl,
        featured:
          updates.featured !== undefined
            ? updates.featured
              ? 1
              : 0
            : existing.featured,
        active:
          updates.active !== undefined
            ? updates.active
              ? 1
              : 0
            : existing.active,
        order: updates.order ?? existing.order,
        categoryId: updates.categoryId ?? existing.categoryId,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', id)
      .execute();

    return await kysely
      .selectFrom('ranking_items')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async deleteRankingItem(id: string): Promise<{ success: boolean }> {
    await this.ensureReady();
    const success = await kysely.transaction().execute(async (trx) => {
      await trx.deleteFrom('ratings').where('itemId', '=', id).execute();
      const result = await trx
        .deleteFrom('ranking_items')
        .where('id', '=', id)
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0) > 0;
    });

    return { success };
  }

  async getItemStats(): Promise<{ totalItems: number; activeItems: number }> {
    await this.ensureReady();
    const totals = await kysely
      .selectFrom('ranking_items')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();
    const active = await kysely
      .selectFrom('ranking_items')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('active', '=', 1)
      .executeTakeFirst();

    return {
      totalItems: Number(totals?.count ?? 0),
      activeItems: Number(active?.count ?? 0),
    };
  }

  // Ratings -----------------------------------------------------------------

  private async recalcItem(itemId: string) {
    const agg = await kysely
      .selectFrom('ratings')
      .select((eb) => [
        eb.fn.countAll().as('total'),
        eb.fn.coalesce(eb.fn.avg('value'), sql`0`).as('avg'),
      ])
      .where('itemId', '=', itemId)
      .executeTakeFirst();

    const total = Number(agg?.total ?? 0);
    const avg = Number(agg?.avg ?? 0);
    const averageRating = total > 0 ? Math.round(avg * 10) / 10 : 0;

    await kysely
      .updateTable('ranking_items')
      .set({
        totalRatings: total,
        averageRating,
        updatedAt: new Date().toISOString(),
      })
      .where('id', '=', itemId)
      .execute();
  }

  async createRating(data: {
    userId: string;
    itemId: string;
    value: number;
  }): Promise<Rating> {
    await this.ensureReady();
    const now = new Date().toISOString();

    const rating = await kysely
      .insertInto('ratings')
      .values({
        id: this.generateId('rating'),
        userId: data.userId,
        itemId: data.itemId,
        value: data.value,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) =>
        oc.columns(['userId', 'itemId']).doUpdateSet({
          value: (qb) => qb.ref('excluded.value'),
          updatedAt: (qb) => qb.ref('excluded.updatedAt'),
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    await this.recalcItem(data.itemId);
    return rating;
  }

  async getAllRatings(): Promise<
    (Rating & {
      user?: Pick<User, 'id' | 'name' | 'email'>;
      item?: Pick<RankingItem, 'id' | 'name'>;
    })[]
  > {
    await this.ensureReady();

    const rows = await kysely
      .selectFrom('ratings as r')
      .leftJoin('users as u', 'u.id', 'r.userId')
      .leftJoin('ranking_items as i', 'i.id', 'r.itemId')
      .select([
        'r.id',
        'r.value',
        'r.userId',
        'r.itemId',
        'r.createdAt',
        'r.updatedAt',
        'u.id as user_id',
        'u.name as user_name',
        'u.email as user_email',
        'i.id as item_id',
        'i.name as item_name',
      ])
      .orderBy('r.updatedAt', 'desc')
      .execute();

    return rows.map((row) => ({
      id: row.id,
      value: row.value,
      userId: row.userId,
      itemId: row.itemId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user_id
        ? { id: row.user_id, name: row.user_name, email: row.user_email }
        : undefined,
      item: row.item_id ? { id: row.item_id, name: row.item_name } : undefined,
    }));
  }

  async updateRating(id: string, value: number): Promise<Rating | null> {
    await this.ensureReady();
    const rating = await kysely
      .selectFrom('ratings')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    if (!rating) return null;

    await kysely
      .updateTable('ratings')
      .set({ value, updatedAt: new Date().toISOString() })
      .where('id', '=', id)
      .execute();

    await this.recalcItem(rating.itemId);
    return (
      (await kysely
        .selectFrom('ratings')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()) ?? null
    );
  }

  async deleteRating(id: string): Promise<{ success: boolean }> {
    await this.ensureReady();
    const rating = await kysely
      .selectFrom('ratings')
      .select(['id', 'itemId'])
      .where('id', '=', id)
      .executeTakeFirst();
    if (!rating) return { success: false };

    const result = await kysely
      .deleteFrom('ratings')
      .where('id', '=', id)
      .executeTakeFirst();

    await this.recalcItem(rating.itemId);
    return { success: Number(result.numDeletedRows ?? 0) > 0 };
  }

  async getRatingStats(): Promise<{
    totalRatings: number;
    averageRating: number;
    uniqueRaters: number;
  }> {
    await this.ensureReady();
    const totals = await kysely
      .selectFrom('ratings')
      .select((eb) => [
        eb.fn.countAll().as('count'),
        eb.fn.coalesce(eb.fn.avg('value'), sql`0`).as('avg'),
      ])
      .executeTakeFirst();
    const unique = await kysely
      .selectFrom('ratings')
      .select((eb) => eb.fn.countDistinct('userId').as('count'))
      .executeTakeFirst();

    const totalRatings = Number(totals?.count ?? 0);
    const averageRating =
      totalRatings > 0 ? Math.round(Number(totals?.avg ?? 0) * 10) / 10 : 0;

    return {
      totalRatings,
      averageRating,
      uniqueRaters: Number(unique?.count ?? 0),
    };
  }

  // Accounts & Sessions -----------------------------------------------------

  async findAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    await this.ensureReady();
    return (
      (await kysely
        .selectFrom('accounts')
        .selectAll()
        .where('provider', '=', provider)
        .where('providerAccountId', '=', providerAccountId)
        .executeTakeFirst()) ?? null
    );
  }

  async createAccount(data: Omit<Account, 'id'>): Promise<Account> {
    await this.ensureReady();
    const id = this.generateId('acc');

    await kysely
      .insertInto('accounts')
      .values({
        id,
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token ?? null,
        access_token: data.access_token ?? null,
        expires_at: data.expires_at ?? null,
        token_type: data.token_type ?? null,
        scope: data.scope ?? null,
        id_token: data.id_token ?? null,
        session_state: data.session_state ?? null,
      })
      .execute();

    return (await kysely
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst())!;
  }

  async findSession(sessionToken: string): Promise<Session | null> {
    await this.ensureReady();
    return (
      (await kysely
        .selectFrom('sessions')
        .selectAll()
        .where('sessionToken', '=', sessionToken)
        .executeTakeFirst()) ?? null
    );
  }

  async createSession(data: Omit<Session, 'id'>): Promise<Session> {
    await this.ensureReady();
    const id = this.generateId('sess');

    await kysely
      .insertInto('sessions')
      .values({
        id,
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      })
      .execute();

    return (await kysely
      .selectFrom('sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst())!;
  }

  async updateSession(
    sessionToken: string,
    updates: Partial<Session>,
  ): Promise<Session | null> {
    await this.ensureReady();
    const existing = await this.findSession(sessionToken);
    if (!existing) return null;

    await kysely
      .updateTable('sessions')
      .set({
        userId: updates.userId ?? existing.userId,
        expires: updates.expires ?? existing.expires,
      })
      .where('sessionToken', '=', sessionToken)
      .execute();

    return await this.findSession(sessionToken);
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await this.ensureReady();
    await kysely
      .deleteFrom('sessions')
      .where('sessionToken', '=', sessionToken)
      .execute();
  }
}

export const db = SQLiteDatabase.getInstance();