import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

export interface LoadingProps {
    full?: boolean;
}

export const Loading = ({ full }: LoadingProps) => {
    if (full) {
        return (
            <Flex width="100%" height="100%" align="center" justify="center">
                <Spinner />
            </Flex>
        );
    }

    return <Spinner />;
};
