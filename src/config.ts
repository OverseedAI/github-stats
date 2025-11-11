import dayjs from 'dayjs';

import { capitalize } from '@/utils/text';

const APP_NAME = 'prospr'; // TODO: CHANGE ME

export const config = {
    APP_NAME,
    APP_URL: process.env.NODE_ENV === 'development' ? `http://localhost:3000` : 'https://prospr.bandh.ca',
    COOKIE_EXPIRY_DURATION: dayjs().day(30),
    COOKIE_AUTH_NAME: `${APP_NAME}_session`,

    RESET_PASSWORD_TOKEN_EXPIRY_DURATION: dayjs().hour(1),

    EMAIL_SENDER_NAME: capitalize(APP_NAME) + ' App',
    EMAIL_SENDER_ADDRESS: 'hal.shin@alumni.ubc.ca', // TODO: CHANGE ME
    EMAIL_TRANSAC_ENDPOINT: 'https://api.brevo.com/v3/smtp/email',
};
