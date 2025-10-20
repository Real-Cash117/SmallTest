import { createTRPCRouter } from './trpc';
import { ratingRouter } from './routers/rating';
import { rankingItemRouter } from './routers/rankingItem';
import { categoryRouter } from './routers/category';
import { userRouter } from './routers/user';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  rating: ratingRouter,
  rankingItem: rankingItemRouter,
  category: categoryRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;