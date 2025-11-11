import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    Container,
    HStack,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    VStack,
    useColorMode,
    useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'github-stats-recent-searches';

function getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
        return [];
    }
}

export default function GitHubLandingPage() {
    const router = useRouter();
    const { colorMode, toggleColorMode } = useColorMode();
    const toast = useToast();
    const [inputValue, setInputValue] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            const trimmedUsername = inputValue.trim();
            // Navigate to username route
            void router.push(`/github/${trimmedUsername}`);
        }
    };

    const handleRecentSearchClick = (searchUsername: string) => {
        // Navigate to username route
        void router.push(`/github/${searchUsername}`);
    };

    const handleClearRecentSearches = () => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
            setRecentSearches([]);
            toast({
                title: 'Cleared!',
                description: 'Recent searches have been cleared',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to clear recent searches',
                status: 'error',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const bgColor = { light: 'white', dark: 'gray.900' };
    const cardBg = { light: 'white', dark: 'gray.800' };
    const borderColor = { light: 'gray.800', dark: 'gray.600' };
    const textColor = { light: 'gray.900', dark: 'gray.100' };
    const mutedColor = { light: 'gray.600', dark: 'gray.400' };
    const accentBg = { light: 'gray.100', dark: 'gray.700' };

    return (
        <Box bg={bgColor[colorMode]} minH="100vh" py={8}>
            <Container maxW="container.xl">
                <VStack spacing={6} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between" align="start">
                        <Box>
                            <Heading
                                size="xl"
                                mb={2}
                                color={textColor[colorMode]}
                                fontWeight="bold"
                            >
                                GitHub Activity Dashboard
                            </Heading>
                            <Text color={mutedColor[colorMode]}>
                                Overview of your recent contributions and commit activity
                            </Text>
                        </Box>
                        <IconButton
                            aria-label="Toggle dark mode"
                            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            onClick={toggleColorMode}
                            variant="outline"
                            border="2px solid"
                            borderColor={borderColor[colorMode]}
                            boxShadow="none"
                            _hover={{ bg: accentBg[colorMode] }}
                            _active={{ bg: accentBg[colorMode] }}
                        />
                    </HStack>

                    {/* Username Input */}
                    <Card
                        bg={cardBg[colorMode]}
                        border="2px solid"
                        borderColor={borderColor[colorMode]}
                        boxShadow="none"
                    >
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <form onSubmit={handleUsernameSubmit}>
                                    <HStack spacing={3}>
                                        <InputGroup flex={1} maxW="400px">
                                            <InputLeftElement
                                                pointerEvents="none"
                                                color={mutedColor[colorMode]}
                                            >
                                                @
                                            </InputLeftElement>
                                            <Input
                                                placeholder="GitHub username"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                border="2px solid"
                                                borderColor={borderColor[colorMode]}
                                                bg={cardBg[colorMode]}
                                                color={textColor[colorMode]}
                                                boxShadow="none"
                                                _placeholder={{ color: mutedColor[colorMode] }}
                                                _hover={{ borderColor: borderColor[colorMode] }}
                                                _focus={{
                                                    borderColor: borderColor[colorMode],
                                                    boxShadow: 'none',
                                                }}
                                            />
                                        </InputGroup>
                                        <Button
                                            type="submit"
                                            size="md"
                                            bg={textColor[colorMode]}
                                            color={bgColor[colorMode]}
                                            border="2px solid"
                                            borderColor={borderColor[colorMode]}
                                            boxShadow="none"
                                            _hover={{
                                                bg: accentBg[colorMode],
                                                color: textColor[colorMode],
                                            }}
                                            _active={{ bg: accentBg[colorMode] }}
                                        >
                                            Load Stats
                                        </Button>
                                    </HStack>
                                </form>

                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <Box>
                                        <Text
                                            fontSize="sm"
                                            color={mutedColor[colorMode]}
                                            mb={2}
                                            fontWeight="bold"
                                        >
                                            Recent Searches:
                                        </Text>
                                        <HStack spacing={2} flexWrap="wrap">
                                            {recentSearches.map((searchUser) => (
                                                <Button
                                                    key={searchUser}
                                                    size="sm"
                                                    variant="outline"
                                                    border="2px solid"
                                                    borderColor={borderColor[colorMode]}
                                                    bg="transparent"
                                                    color={textColor[colorMode]}
                                                    boxShadow="none"
                                                    _hover={{ bg: accentBg[colorMode] }}
                                                    _active={{ bg: accentBg[colorMode] }}
                                                    onClick={() =>
                                                        handleRecentSearchClick(searchUser)
                                                    }
                                                    leftIcon={
                                                        <Text
                                                            fontSize="xs"
                                                            color={mutedColor[colorMode]}
                                                        >
                                                            @
                                                        </Text>
                                                    }
                                                >
                                                    {searchUser}
                                                </Button>
                                            ))}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                color={mutedColor[colorMode]}
                                                fontSize="xs"
                                                boxShadow="none"
                                                _hover={{
                                                    color: 'red.500',
                                                    bg: accentBg[colorMode],
                                                }}
                                                _active={{
                                                    bg: accentBg[colorMode],
                                                }}
                                                onClick={handleClearRecentSearches}
                                            >
                                                Clear
                                            </Button>
                                        </HStack>
                                    </Box>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Empty State */}
                    <Card
                        bg={cardBg[colorMode]}
                        border="2px solid"
                        borderColor={borderColor[colorMode]}
                        boxShadow="none"
                    >
                        <CardBody>
                            <Center py={12}>
                                <VStack spacing={4}>
                                    <Box fontSize="6xl" color={mutedColor[colorMode]}>
                                        📊
                                    </Box>
                                    <Heading
                                        size="md"
                                        color={textColor[colorMode]}
                                        fontWeight="bold"
                                    >
                                        Get Started
                                    </Heading>
                                    <Text
                                        color={mutedColor[colorMode]}
                                        textAlign="center"
                                        maxW="400px"
                                    >
                                        Enter a GitHub username above to view their commit activity and
                                        statistics
                                    </Text>
                                </VStack>
                            </Center>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
        </Box>
    );
}
