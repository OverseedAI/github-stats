import { config } from '@/config';
import { env } from '@/env';
import { client } from '@/lib/client';

interface EmailAddress {
    name: string;
    email: string;
}

const defaultSender: EmailAddress = {
    email: config.EMAIL_SENDER_ADDRESS,
    name: config.EMAIL_SENDER_NAME,
};

export const sendTransacEmail = (props: {
    subject: string;
    htmlContent: string;
    sender?: EmailAddress;
    to: EmailAddress | Array<EmailAddress>;
    cc?: EmailAddress | Array<EmailAddress>;
    bcc?: EmailAddress | Array<EmailAddress>;
    replyTo?: EmailAddress;
    headers?: Record<string, string>;
    params?: Record<string, string>;
}) => {
    const sendSmtpEmail: Record<string, any> = {};

    sendSmtpEmail.subject = props.subject;
    sendSmtpEmail.htmlContent = props.htmlContent;
    sendSmtpEmail.sender = props.sender ?? defaultSender;

    if (Array.isArray(props.to)) {
        sendSmtpEmail.to = props.to;
    } else {
        sendSmtpEmail.to = [props.to];
    }

    if (Array.isArray(props.cc)) {
        sendSmtpEmail.cc = props.cc;
    } else if (props.cc) {
        sendSmtpEmail.cc = [props.cc];
    }

    if (Array.isArray(props.bcc)) {
        sendSmtpEmail.bcc = props.bcc;
    } else if (props.bcc) {
        sendSmtpEmail.bcc = [props.bcc];
    }

    sendSmtpEmail.replyTo = props.replyTo ?? defaultSender;
    sendSmtpEmail.headers = props.headers;
    sendSmtpEmail.params = props.params;

    return client.post(config.EMAIL_TRANSAC_ENDPOINT, sendSmtpEmail, {
        headers: {
            'api-key': env.BREVO_API_KEY,
        },
    });
};
