import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { JSONDatabase } from "~/lib/database";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getAllCategories();
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().default("blue"),
    }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
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
      const db = JSONDatabase.getInstance();
      const { id, ...updates } = input;
      return await db.updateCategory(id, updates);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.deleteCategory(input.id);
    }),
});