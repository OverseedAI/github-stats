import { eq } from 'drizzle-orm';
import { type GetServerSidePropsContext } from 'next';

import { config } from '@/config';
import { type CookieContext } from '@/server/cookie';
import { db } from '@/server/db';

export const setSessionContext = async (ctx: {
    req: GetServerSidePropsContext['req'];
    res: GetServerSidePropsContext['res'];
    cookies: CookieContext;
}) => {
    const { cookies } = ctx;

    const sessionToken = cookies.getCookie(config.COOKIE_AUTH_NAME);

    if (!sessionToken) return null;

    const foundSession = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.sessionToken, sessionToken),
    });

    if (!foundSession) {
        return null;
    }

    const foundUser = await db.query.users.findFirst({
        where: (users) => eq(users.id, foundSession.userId),
        with: {
            usersToOrganizations: {
                with: {
                    organization: true,
                },
            },
        },
        columns: {
            password: false,
        },
    });

    if (!foundUser) return null;

    return {
        user: foundUser,
    };
};
