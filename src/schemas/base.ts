import { timestamp } from 'drizzle-orm/pg-core';

export const baseEntity = {
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
};
