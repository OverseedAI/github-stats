import { Box, type BoxProps, Flex, Heading, Text } from '@chakra-ui/react';
import React, { type ReactNode } from 'react';

import { ProtectedRoute } from '@/components/Routes';

import { Sidebar } from './Sidebar';

interface AppLayoutProps extends Omit<BoxProps, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
}

export const AppLayout = ({ title, description, actions, children, ...rest }: AppLayoutProps) => {
    return (
        <ProtectedRoute>
            <Flex height="100vh">
                <Sidebar />
                <Box as="main" flex={1} p={4} {...rest}>
                    {title && (
                        <Box mb={4}>
                            <Flex justify="space-between">
                                <Heading size="lg" fontWeight="bolder" flex={1} mr={1}>
                                    {title}
                                </Heading>
                                {actions}
                            </Flex>
                            <Text color="gray.500">{description}</Text>
                        </Box>
                    )}
                    {children}
                </Box>
            </Flex>
        </ProtectedRoute>
    );
};
