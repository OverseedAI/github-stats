import { ArrowBackIcon } from '@chakra-ui/icons';
import {
    Container,
    type ContainerProps,
    Flex,
    type FlexProps,
    Heading,
    IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';
import React, { type ReactNode } from 'react';

interface AuthLayoutProps extends Omit<FlexProps, 'title'> {
    title: ReactNode;
    actions?: ReactNode;
    backButtonUrl?: string;
    containerProps?: ContainerProps;
    children: ReactNode;
}

export const AuthLayout = ({
    title,
    actions,
    backButtonUrl,
    containerProps,
    children,
    ...rest
}: AuthLayoutProps) => {
    return (
        <Flex
            height="100vh"
            bgColor="green.700"
            bgGradient="linear(to-r, green.400, blue.400)"
            justify="center"
            align="center"
            {...rest}
        >
            <Container
                maxWidth="container.sm"
                bgColor="white"
                borderRadius="md"
                boxShadow="md"
                p={4}
                {...containerProps}
            >
                <Flex justify="between" width="100%">
                    {backButtonUrl && (
                        <IconButton
                            aria-label="Go back to homepage"
                            as={Link}
                            href={backButtonUrl}
                            icon={<ArrowBackIcon />}
                            variant="ghost"
                            mr={2}
                        />
                    )}
                    <Heading mb={4} size="lg" flex={1}>
                        {title}
                    </Heading>
                    {actions}
                </Flex>
                {children}
            </Container>
        </Flex>
    );
};
