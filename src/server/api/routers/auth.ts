import { TRPCError } from '@trpc/server';
import { type AxiosError } from 'axios';
import { compare, hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as process from 'process';
import { z } from 'zod';

import { config } from '@/config';
import { type User, defaultUserOutput, resetTokens, sessions, users } from '@/schemas';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { sendTransacEmail } from '@/server/email';
import { createOrganization } from '@/server/services/organization';
import { uuid } from '@/utils/random';

const SALT_ROUNDS = 10;

export const authRouter = createTRPCRouter({
    checkMe: protectedProcedure.query(({ ctx }) => {
        return ctx.session.user;
    }),
    register: publicProcedure
        .input(
            z.object({
                name: z.string().min(1).max(255),
                email: z.string().min(1).email(),
                password: z.string().min(8).max(255),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { name, email, password } = input;

            const foundUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email),
            });

            if (foundUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'An account already exists with that email address.',
                    cause: email,
                });
            }

            const hashedPassword = await hash(password, SALT_ROUNDS);

            try {
                const [createdUser] = await db
                    .insert(users)
                    .values({
                        name: name.trim(),
                        email,
                        password: hashedPassword,
                    })
                    .returning(defaultUserOutput);

                if (!createdUser) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Unable to create user.',
                    });
                }

                await createOrganization(createdUser as User, {
                    name: createdUser.name + "'s Organization",
                });

                // Generate session and store it in cookie
                const sessionToken = uuid();
                await db.insert(sessions).values({
                    sessionToken,
                    expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                    userId: createdUser.id,
                });

                ctx.cookies.setCookie(config.COOKIE_AUTH_NAME, sessionToken, {
                    expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                });

                return createdUser;
            } catch (e) {
                console.log('User creation error:', e);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Unable to create user.',
                });
            }
        }),

    login: publicProcedure
        .input(
            z.object({
                email: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { email, password } = input;
            const unauthorizedError = new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unable to login with those credentials.',
            });

            const foundUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email),
            });

            if (!foundUser) throw unauthorizedError;

            const isPasswordCorrect = await compare(password, foundUser.password);

            if (!isPasswordCorrect) throw unauthorizedError;

            // Generate session and store it in cookie
            const sessionToken = uuid();
            await db
                .insert(sessions)
                .values({
                    sessionToken,
                    expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                    userId: foundUser.id,
                })
                .onConflictDoUpdate({
                    target: sessions.userId,
                    set: { sessionToken },
                });

            ctx.cookies.setCookie(config.COOKIE_AUTH_NAME, sessionToken, {
                expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            return {
                message: 'Logged in successfully!',
            };
        }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        await db.delete(sessions).where(eq(sessions.userId, userId));

        ctx.cookies.deleteCookie(config.COOKIE_AUTH_NAME);

        return { message: 'Logged out successfully!' };
    }),

    forgotPassword: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
            })
        )
        .mutation(async ({ input }) => {
            const foundUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, input.email),
            });

            if (!foundUser) {
                return {
                    message: 'A password reset email has been sent!',
                };
            }

            const resetToken = uuid();

            await db.insert(resetTokens).values({
                expires: config.RESET_PASSWORD_TOKEN_EXPIRY_DURATION.toDate(),
                userId: foundUser.id,
                resetToken,
            });

            sendTransacEmail({
                subject: 'Password Reset for Prospr Account',
                htmlContent: `
                <p>A password reset request was submitted to this account.</p>
                <p>To reset your password, please click the link below:</p>
                <a href="{{ params.tokenUrl }}">Reset Password</a>
                <p>If you did not request a password reset, please disregard this email.</p>
                               `,
                to: { email: 'hal.shin@alumni.ubc.ca', name: 'Hal' },
                params: {
                    tokenUrl:
                        config.APP_URL +
                        `/reset-password?token=${resetToken}&email=${foundUser.email}`,
                },
            }).catch((err: AxiosError) => console.log('ERROR:', err.response?.data));

            return {
                message: 'A password reset email has been sent!',
            };
        }),

    resetPassword: publicProcedure
        .input(
            z.object({
                password: z.string().min(8).max(255),
                email: z.string().email(),
                resetToken: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { resetToken, email, password } = input;

            const error = {
                message: 'Invalid token. Please request password reset again.',
            };

            const foundResetToken = await db.query.resetTokens.findFirst({
                where: (resetTokens, { eq }) => eq(resetTokens.resetToken, resetToken),
            });

            if (!foundResetToken) return error;

            const foundUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.id, foundResetToken.userId),
            });

            if (!foundUser) return error;
            if (foundUser.email !== email) return error;

            const hashedPassword = await hash(password, SALT_ROUNDS);

            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, foundUser.id));

            await db.delete(resetTokens).where(eq(resetTokens.resetToken, resetToken));

            // Generate session and store it in cookie
            const sessionToken = uuid();
            await db
                .insert(sessions)
                .values({
                    sessionToken,
                    expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                    userId: foundUser.id,
                })
                .onConflictDoUpdate({
                    target: sessions.userId,
                    set: { sessionToken },
                });

            ctx.cookies.setCookie(config.COOKIE_AUTH_NAME, sessionToken, {
                expires: config.COOKIE_EXPIRY_DURATION.toDate(),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            return { message: 'Password reset successfully!' };
        }),
});
