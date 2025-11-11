import { Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';

import { AppLayout } from '@/components';

export default function Settings() {
    return (
        <AppLayout title={'Settings'}>
            <Flex flexDirection={'column'}>
                <Heading as="h3" size={'lg'}>
                    Settings
                </Heading>
                <Text color={'gray.500'}>No backend available - settings removed.</Text>
            </Flex>
        </AppLayout>
    );
}
