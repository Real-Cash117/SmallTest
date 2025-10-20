import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { JSONDatabase } from "~/lib/database";

export const userRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getUserStats();
  }),

  getAll: adminProcedure.query(async () => {
    const db = JSONDatabase.getInstance();
    return await db.getAllUsers();
  }),

  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
    }))
    .mutation(async ({ input }) => {
      const db = JSONDatabase.getInstance();
      return await db.updateUser(input.userId, { role: input.role });
    }),

  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) return null;
    
    const db = JSONDatabase.getInstance();
    return await db.findUserByEmail(ctx.session.user.email);
  }),
});