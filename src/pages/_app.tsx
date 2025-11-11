import { type AppType } from 'next/app';
import Script from 'next/script';

import { Providers } from '@/providers/Providers';
import '@/styles/globals.css';

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
    return (
        <>
            <Script
                defer
                src="https://analytics.bandh.ca/script.js"
                data-website-id="2970738a-4e1b-4a2b-b6ba-a730689e1479"
                strategy="afterInteractive"
            />
            <Providers>
                <Component {...pageProps} />
            </Providers>
        </>
    );
};

export default MyApp;
