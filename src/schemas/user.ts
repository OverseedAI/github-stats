import { getTableColumns, relations } from 'drizzle-orm';
import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

import { baseEntity } from '@/schemas/base';
import { usersToOrganizations } from '@/schemas/organization';

export const users = pgTable('user', {
    ...baseEntity,
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    emailVerified: timestamp('emailVerified', {
        mode: 'date',
    }),
    phone: varchar('phone', { length: 255 }),
    image: varchar('image', { length: 255 }),
    password: varchar('password', { length: 255 }).notNull(),
});

export type User = Omit<typeof users.$inferSelect, 'password'>;
export type NewUser = typeof users.$inferInsert;

const { password, ...rest } = getTableColumns(users);
export const userWithoutPassword = rest;
export const defaultUserOutput = {
    id: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
};

export const usersRelations = relations(users, ({ many }) => ({
    usersToOrganizations: many(usersToOrganizations),
}));
