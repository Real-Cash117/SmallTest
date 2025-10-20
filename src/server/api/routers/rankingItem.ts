import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { JSONDatabase } from "~/lib/database";

export const rankingItemRouter = createTRPCRouter({
  // Admin procedures
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      categoryId: z.string(),
      imageUrl: z.string().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.createRankingItem({
        ...input,
        averageRating: 0,
        totalRatings: 0,
        active: true,
      });
    }),

  // Public procedures
  getByCategory: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.getItemsByCategory(input.categoryId);
    }),

  getAll: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getAllItems();
  }),

  getStats: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getItemStats();
  }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.string().optional(),
      imageUrl: z.string().optional(),
      featured: z.boolean().optional(),
      active: z.boolean().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      const { id, ...updates } = input;
      return await db.updateRankingItem(id, updates);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.deleteRankingItem(input.id);
    }),

  getFeatured: publicProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getFeaturedItems();
  }),

  rate: publicProcedure
    .input(z.object({
      itemId: z.string(),
      rating: z.number().min(1).max(10),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.email) {
        throw new Error("Must be logged in to rate items");
      }

      const db = JSONDatabase.getInstance();
      const user = await db.findUserByEmail(ctx.session.user.email);
      
      if (!user) {
        throw new Error("User not found");
      }

      return await db.createRating({
        userId: user.id,
        itemId: input.itemId,
        value: input.rating,
      });
    }),
});