import { ChakraProvider } from '@chakra-ui/react';
import { type Dict } from '@chakra-ui/utils';
import React, { Suspense } from 'react';

import { Loading } from '@/components';
import { theme } from '@/theme';
import { SessionProvider } from '@/utils/session';

interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
    return (
        <SessionProvider>
            <ChakraProvider theme={theme as Dict}>
                <Suspense fallback={<Loading full />}>{children}</Suspense>
            </ChakraProvider>
        </SessionProvider>
    );
};
