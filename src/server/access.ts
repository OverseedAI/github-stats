import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import { type Organization } from '@/schemas';
import { db } from '@/server/db';

export const checkOrganizationAccess = async (userId: number, organization?: Organization) => {
    if (!organization) {
        throw new TRPCError({
            code: 'NOT_FOUND',
        });
    }

    const foundUserToOrganization = await db.query.usersToOrganizations.findFirst({
        where: (usersToOrganizations) =>
            and(
                eq(usersToOrganizations.userId, userId),
                eq(usersToOrganizations.organizationId, organization.id)
            ),
    });

    if (!foundUserToOrganization) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You do not belong to this organization.',
        });
    }

    return organization;
};

export const checkOrganizationAccessBySlug = async (organizationSlug: string, userId: number) => {
    const foundOrganization = await db.query.organizations.findFirst({
        where: (organizations) => eq(organizations.slug, organizationSlug),
    });

    const organization = await checkOrganizationAccess(userId, foundOrganization);

    return organization;
};

export const checkOrganizationAccessById = async (organizationId: number, userId: number) => {
    const foundOrganization = await db.query.organizations.findFirst({
        where: (organizations) => eq(organizations.id, organizationId),
    });

    const organization = await checkOrganizationAccess(userId, foundOrganization);

    return organization;
};
