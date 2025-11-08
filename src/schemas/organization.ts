import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { baseEntity } from '@/schemas/base';
import { users } from '@/schemas/user';

export const organizations = pgTable('organization', {
    ...baseEntity,
    id: serial('id').primaryKey(),
    name: text('name').unique(),
    slug: text('slug').unique(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export const usersToOrganizations = pgTable('usersToOrganizations', {
    userId: integer('userId')
        .notNull()
        .references(() => users.id),
    organizationId: integer('organizationId')
        .notNull()
        .references(() => organizations.id),
});

export const usersToOrganizationsRelations = relations(usersToOrganizations, ({ one }) => ({
    organization: one(organizations, {
        fields: [usersToOrganizations.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [usersToOrganizations.userId],
        references: [users.id],
    }),
}));

export type UsersToOrganizations = typeof usersToOrganizations.$inferSelect;
export type NewUsersToOrganizations = typeof usersToOrganizations.$inferInsert;

export const selectOrganizationSchema = createSelectSchema(organizations);
export const insertOrganizationSchema = createInsertSchema(organizations);
export const updateOrganizationSchema = insertOrganizationSchema;
