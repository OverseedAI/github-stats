import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { insertOrganizationSchema, updateOrganizationSchema } from '@/schemas';
import { checkOrganizationAccessById } from '@/server/access';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import {
    createOrganization,
    deleteOrganizationById,
    getOrganizationById,
    updateOrganizationById,
} from '@/server/services';

export const organizationsRouter = createTRPCRouter({
    getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            const organization = await getOrganizationById(input.id);
            const userId = ctx.session.user.id;

            if (!organization) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            await checkOrganizationAccessById(organization.id, userId);

            return organization;
        }),

    // getMany: protectedProcedure
    //     .input(
    //         z.object({
    //             organizationSlug: z.string(),
    //         })
    //     )
    //     .query(async ({ input, ctx }) => {
    //         const organizationSlug = input.organizationSlug;
    //         const userId = ctx.session.user.id;
    //
    //         const organization = await checkOrganizationAccessBySlug(
    //             organizationSlug,
    //             userId
    //         );
    //
    //         const organization = await getOrganizations(organization);
    //
    //         return organization;
    //     }),

    create: protectedProcedure.input(insertOrganizationSchema).mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id;

        const createdOrganization = await createOrganization(input, ctx.session.user);

        return createdOrganization;
    }),

    update: protectedProcedure.input(updateOrganizationSchema).mutation(async ({ input, ctx }) => {
        if (!input.id) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Please provide the resource ID',
            });
        }

        const foundOrganization = await db.query.organizations.findFirst({
            where: (organization) => eq(organization.id, input.id!),
        });

        if (!foundOrganization) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }

        await checkOrganizationAccessById(foundOrganization.id, ctx.session.user.id);

        const updatedOrganization = await updateOrganizationById(input.id, input);

        return updatedOrganization;
    }),

    delete: protectedProcedure
        .input(
            z.object({
                id: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const foundOrganization = await db.query.organizations.findFirst({
                where: (organization) => eq(organization.id, input.id),
            });

            if (!foundOrganization) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            await checkOrganizationAccessById(foundOrganization.id, ctx.session.user.id);

            const deletedOrganization = await deleteOrganizationById(input.id);

            return deletedOrganization;
        }),
});
