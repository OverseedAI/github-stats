import { Box, Flex, Heading, Input, Text } from '@chakra-ui/react';
import React from 'react';

import { AppLayout } from '@/components';
import { useOrganization } from '@/hooks';
import { api } from '@/utils/api';
import { useSession } from '@/utils/session';

export default function Settings() {
    const org = useOrganization();
    const session = useSession();
    const updateOrg = api.orgs.update.useMutation();

    const handleOrgNameChange = (newName: string) => {
        if (!org) return;

        const newNameFormatted = newName.trim();
        const nameIsDifferent = newNameFormatted !== org.name;

        if (nameIsDifferent) {
            updateOrg.mutate(
                { ...org, name: newNameFormatted },
                {
                    onSuccess: () => {
                        session.revalidate();
                    },
                }
            );
        }
    };

    if (!org) return;

    return (
        <AppLayout title={'Settings'}>
            <Flex flexDirection={'column'}>
                <Flex>
                    <Box flex={1}>
                        <Heading as="h3" size={'lg'}>
                            Organization Name
                        </Heading>
                        <Text color={'gray.500'}>Update your organization name here.</Text>
                    </Box>
                    <Input
                        defaultValue={org.name ?? ''}
                        onBlur={(e) => handleOrgNameChange(e.target.value)}
                        width={300}
                    />
                </Flex>
            </Flex>
        </AppLayout>
    );
}
