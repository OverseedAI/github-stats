import { Box, Button, Flex, HStack, Heading } from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';

import { config } from '@/config';
import { useSession } from '@/utils/session';

export default function Home() {
    const session = useSession();

    return (
        <>
            <Head>
                <title>{config.APP_NAME}</title>
                <meta
                    name="description"
                    content="Prospr is a personal finance app" // TODO: CHANGE ME
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="h-screen">
                <Flex
                    as="header"
                    bgColor="blue.500"
                    px={4}
                    py={2}
                    position="fixed"
                    width="100%"
                    top={0}
                >
                    <Box flex={1}>
                        <Heading size="lg" color="" fontWeight="bold">
                            {config.APP_NAME}
                        </Heading>
                    </Box>
                    <Flex>
                        {session.status === 'authenticated' && (
                            <Button as={Link} href="/app" colorScheme="blue" variant="solid">
                                Dashboard
                            </Button>
                        )}
                        {session.status === 'unauthenticated' && (
                            <HStack>
                                <Button as={Link} href="/login" colorScheme="blue">
                                    Login
                                </Button>
                                <Button as={Link} href="/register">
                                    Register
                                </Button>
                            </HStack>
                        )}
                    </Flex>
                </Flex>
                <Flex
                    as="section"
                    height="100vh"
                    flexDirection="column"
                    justify="center"
                    align="center"
                    bgColor="green.200"
                >
                    <Heading size="2xl">{config.APP_NAME}</Heading>
                    <p>Take control of your household finances.</p>
                </Flex>
            </main>
        </>
    );
}
