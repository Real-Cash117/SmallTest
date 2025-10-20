import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';
import { db } from '~/lib/database/sqlite';

export const ratingRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    return await db.getAllRatings();
  }),

  getStats: adminProcedure.query(async () => {
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
      return await db.updateRating(input.id, input.value);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.deleteRating(input.id);
    }),
});