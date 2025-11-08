import { relations } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/schemas/user';

export const sessions = pgTable(
    'session',
    {
        sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
        userId: integer('userId').unique().notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (session) => ({
        userIdIdx: index('session_userId_idx').on(session.userId),
    })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const resetTokens = pgTable(
    'resetToken',
    {
        resetToken: varchar('resetToken', { length: 255 }).notNull().primaryKey(),
        userId: integer('userId').unique().notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (resetToken) => ({
        userIdIdx: index('resetToken_userId_idx').on(resetToken.userId),
    })
);

export const resetTokenRelations = relations(resetTokens, ({ one }) => ({
    user: one(users, { fields: [resetTokens.userId], references: [users.id] }),
}));
