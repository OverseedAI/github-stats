import { authRouter } from '@/server/api/routers/auth';
import { organizationsRouter } from '@/server/api/routers/organizations';
import { githubRouter } from '@/server/api/routers/github';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    auth: authRouter,
    orgs: organizationsRouter,
    github: githubRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
