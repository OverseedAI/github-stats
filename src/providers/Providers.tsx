import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';

import { Loading } from '@/components';
import { theme } from '@/theme';
import { SessionProvider } from '@/utils/session';

interface ProvidersProps {
    children: React.ReactNode;
}

const queryClient = new QueryClient();

export const Providers = ({ children }: ProvidersProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <ChakraProvider theme={theme}>
                    <Suspense fallback={<Loading full />}>{children}</Suspense>
                </ChakraProvider>
            </SessionProvider>
        </QueryClientProvider>
    );
};
