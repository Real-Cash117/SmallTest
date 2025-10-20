import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { db } from "~/lib/database/sqlite";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.getAllCategories();
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().default("blue"),
    }))
    .mutation(async ({ input }) => {
      return await db.createCategory(input);
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return await db.updateCategory(id, updates);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.deleteCategory(input.id);
    }),
});