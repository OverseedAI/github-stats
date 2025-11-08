import { type Config } from 'drizzle-kit';

import { env } from '@/env.js';

export default {
    schema: './src/schemas/index.ts',
    driver: 'pg',
    dbCredentials: {
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DB,
    },
    out: 'drizzle',
    verbose: true,
} satisfies Config;
