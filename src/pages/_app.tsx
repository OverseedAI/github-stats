import { type AppType } from 'next/app';

import { Providers } from '@/providers/Providers';
import '@/styles/globals.css';
import { api } from '@/utils/api';

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
    return (
        <Providers>
            <Component {...pageProps} />
        </Providers>
    );
};

export default api.withTRPC(MyApp);
