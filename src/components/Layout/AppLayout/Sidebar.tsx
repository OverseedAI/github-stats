import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useOrganization } from '@/hooks/useOrganization';

const NAVIGATION = [
    {
        name: 'Dashboard',
        url: '/dashboard',
    },
    {
        name: 'Settings',
        url: '/settings',
    },
];

interface SidebarProps {}

export const Sidebar = ({}: SidebarProps) => {
    const router = useRouter();
    const organization = useOrganization();

    return (
        <Flex as="nav" flexDir="column" minWidth={280} bgColor="teal.100">
            <Box>
                <Heading size="lg" textAlign="center" py={4}>
                    {organization?.name}
                </Heading>
            </Box>
            <VStack align="stretch" mx={2}>
                {NAVIGATION.map((nav) => {
                    const IS_CURRENT_PAGE = router.pathname === nav.url;
                    return (
                        <Button
                            as={Link}
                            key={nav.url}
                            href={`/app/${organization?.slug}` + nav.url}
                            variant={IS_CURRENT_PAGE ? 'solid' : 'ghost'}
                            colorScheme="blue"
                        >
                            {nav.name}
                        </Button>
                    );
                })}
            </VStack>
        </Flex>
    );
};
