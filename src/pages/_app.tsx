import { type AppType } from 'next/app';

import { Providers } from '@/providers/Providers';
import '@/styles/globals.css';

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
    return (
        <Providers>
            <Component {...pageProps} />
        </Providers>
    );
};

export default MyApp;
