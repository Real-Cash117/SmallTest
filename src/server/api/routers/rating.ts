import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';
import { JSONDatabase } from '~/lib/database';

export const ratingRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getAllRatings();
  }),

  getStats: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getRatingStats();
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.number().min(1).max(10),
      }),
    )
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.updateRating(input.id, input.value);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.deleteRating(input.id);
    }),
});