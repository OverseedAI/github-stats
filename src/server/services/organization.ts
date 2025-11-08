import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import {
    type NewOrganization,
    type Organization,
    type User,
    organizations,
    usersToOrganizations,
} from '@/schemas';
import { db } from '@/server/db';

export const getOrganizationById = async (id: number) => {
    const organization = await db.query.organizations.findFirst({
        where: (organization) => eq(organization.id, id),
    });

    return organization;
};

export const createOrganization = async (details: NewOrganization, user: User) => {
    let slug = details.slug;

    if (!slug) {
        slug = details.name
            ?.normalize('NFKD') // split accented characters into their base characters and diacritical marks
            .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
            .trim() // trim leading or trailing whitespace
            .toLowerCase() // convert to lowercase
            .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
            .replace(/\s+/g, '-') // replace spaces with hyphens
            .replace(/-+/g, '-'); // remove consecutive hyphens;
    }

    const [createdOrganization] = await db
        .insert(organizations)
        .values({ ...details, slug })
        .onConflictDoNothing()
        .returning();

    if (!createdOrganization) return;

    const [createdUserToOrganization] = await db
        .insert(usersToOrganizations)
        .values({ organizationId: createdOrganization.id, userId: user.id });

    if (!createdUserToOrganization) return;

    return createdOrganization;
};

export const updateOrganizationById = async (
    id: number,
    input: NewOrganization
): Promise<Organization> => {
    if (!id) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Id not provided for update.',
        });
    }

    const [updatedOrganization] = await db
        .update(organizations)
        .set(input)
        .where(eq(organizations.id, id))
        .returning();

    if (!updatedOrganization) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Unable to update organization.',
        });
    }

    return updatedOrganization;
};

export const deleteOrganizationById = async (id: number): Promise<Organization> => {
    const [deletedOrganization] = await db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();

    if (!deletedOrganization) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Unable to deleted organization.',
        });
    }

    return deletedOrganization;
};
