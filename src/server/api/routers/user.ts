import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { db } from "~/lib/database/sqlite";

export const userRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
    return await db.getUserStats();
  }),

  getAll: adminProcedure.query(async () => {
    return await db.getAllUsers();
  }),

  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    }))
    .mutation(async ({ input }) => {
      return await db.updateUser(input.userId, { role: input.role });
    }),

  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) return null;
    
    return await db.findUserByEmail(ctx.session.user.email);
  }),
});