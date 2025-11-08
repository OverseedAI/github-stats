import cookie, { type CookieSerializeOptions } from 'cookie';
import dayjs from 'dayjs';
import { type NextApiRequest, type NextApiResponse } from 'next';
import process from 'process';

export function getCookies(req: NextApiRequest) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return {};
    return cookie.parse(cookieHeader);
}

export function getCookie(req: NextApiRequest, name: string) {
    const cookies = getCookies(req);
    return cookies[name];
}

export function setCookie(
    res: NextApiResponse,
    name: string,
    value: string,
    options?: CookieSerializeOptions
) {
    res.setHeader('Set-Cookie', [cookie.serialize(name, value, options)]);
}

export function deleteCookie(res: NextApiResponse, name: string) {
    res.setHeader('Set-Cookie', [
        cookie.serialize(name, 'deleted', {
            expires: dayjs().toDate(),
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }),
    ]);
}

export interface CookieContext {
    getCookie: (name: string) => ReturnType<typeof getCookie>;
    getCookies: () => ReturnType<typeof getCookies>;
    setCookie: (
        name: string,
        value: string,
        options?: CookieSerializeOptions
    ) => ReturnType<typeof setCookie>;
    deleteCookie: (name: string) => void;
}

export const setCookieContext = (req: NextApiRequest, res: NextApiResponse): CookieContext => {
    return {
        getCookie: (name: string) => getCookie(req, name),
        getCookies: () => getCookies(req),
        setCookie: (name, value, options) => setCookie(res, name, value, options),
        deleteCookie: (name) => deleteCookie(res, name),
    };
};
