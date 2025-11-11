import { CopyIcon, ExternalLinkIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Center,
    Container,
    Divider,
    HStack,
    Heading,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Spinner,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    useColorMode,
    useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FaLinkedin, FaReddit, FaShare, FaXTwitter } from 'react-icons/fa6';

type DateRange = '7days' | '30days' | '90days' | '1year';

const DATE_RANGES: Record<DateRange, { label: string; days: number }> = {
    '7days': { label: 'Last 7 days', days: 7 },
    '30days': { label: 'Last 30 days', days: 30 },
    '90days': { label: 'Last 90 days', days: 90 },
    '1year': { label: 'Last year', days: 365 },
};

interface Commit {
    sha: string;
    commit: {
        author: {
            name: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
    repository: {
        name: string;
        full_name: string;
        html_url?: string;
        description?: string | null;
    };
}

interface GitHubData {
    commits: Commit[];
    totalCommits: number;
    summary: {
        totalRepositories: number;
        averageCommitsPerDay: string;
        mostActiveDay: {
            date: string | null;
            count: number;
        };
    };
    topRepositories: Array<{
        name: string;
        url: string;
        description: string | null;
        commitCount: number;
    }>;
    activityByDay: Array<{
        date: string;
        count: number;
    }>;
    user: {
        login: string;
        name: string | null;
        avatar_url: string;
        bio: string | null;
        html_url: string;
        blog: string | null;
        twitter_username: string | null;
        public_repos: number;
        followers: number;
        following: number;
    };
}

async function fetchGitHubCommits(
    username: string,
    startDate: string,
    endDate: string
): Promise<GitHubData> {
    try {
        // Call our backend API instead of GitHub directly
        const response = await axios.get<GitHubData>(
            `/api/github/stats?username=${encodeURIComponent(username)}&startDate=${startDate}&endDate=${endDate}`
        );

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error('GitHub user not found');
        }
        if (axios.isAxiosError(error) && error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (axios.isAxiosError(error)) {
            const errorMessage = (error.response?.data as { error?: string })?.error;
            if (errorMessage) {
                throw new Error(errorMessage);
            }
        }
        throw new Error('Failed to fetch GitHub data');
    }
}

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

function saveRecentSearch(username: string) {
    if (typeof window === 'undefined') return;
    try {
        const recent = getRecentSearches();
        // Remove if already exists
        const filtered = recent.filter((u) => u !== username);
        // Add to front
        const updated = [username, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
        // Silently fail if localStorage is not available
    }
}

export default function GitHubStatsPage() {
    const router = useRouter();
    const { username: routeUsername, range: routeRange } = router.query;
    const { colorMode, toggleColorMode } = useColorMode();
    const toast = useToast();
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const commitsPerPage = 10;

    // Get username and date range from URL
    const username = typeof routeUsername === 'string' ? routeUsername : '';
    const selectedRange: DateRange =
        typeof routeRange === 'string' && routeRange in DATE_RANGES
            ? (routeRange as DateRange)
            : '7days';

    // Load recent searches on mount and sync input value with route
    useEffect(() => {
        setRecentSearches(getRecentSearches());
        if (username) {
            setInputValue(username);
        }
    }, [username]);

    const { startDate, endDate } = useMemo(() => {
        const days = DATE_RANGES[selectedRange].days;
        const end = dayjs();
        const start = end.subtract(days, 'day');

        return {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
        };
    }, [selectedRange]);

    const { data, isFetching, error } = useQuery<GitHubData, Error>({
        queryKey: ['github-commits', username, startDate, endDate],
        queryFn: () => fetchGitHubCommits(username, startDate, endDate),
        enabled: !!username && username.length > 0,
        retry: 1,
        retryOnMount: false,
        refetchOnReconnect: false,
        keepPreviousData: false,
        // This ensures old data doesn't show when switching users
        staleTime: 0,
        cacheTime: 0,
    });

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            const trimmedUsername = inputValue.trim();
            setCurrentPage(1); // Reset to first page when changing username
            saveRecentSearch(trimmedUsername);
            setRecentSearches(getRecentSearches());
            // Navigate to new username route with current date range
            void router.push(`/github/${trimmedUsername}?range=${selectedRange}`);
        }
    };

    const handleRecentSearchClick = (searchUsername: string) => {
        setInputValue(searchUsername);
        setCurrentPage(1);
        // Navigate to username route with current date range
        void router.push(`/github/${searchUsername}?range=${selectedRange}`);
    };

    const handleRangeChange = (range: DateRange) => {
        setCurrentPage(1); // Reset to first page when changing date range
        // Update URL with new date range
        void router.push(`/github/${username}?range=${range}`, undefined, { shallow: true });
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

    // Pagination logic for commits
    const paginatedCommits = useMemo(() => {
        if (!data?.commits) return [];
        const startIndex = (currentPage - 1) * commitsPerPage;
        const endIndex = startIndex + commitsPerPage;
        return data.commits.slice(startIndex, endIndex);
    }, [data?.commits, currentPage, commitsPerPage]);

    const totalPages = useMemo(() => {
        if (!data?.commits) return 0;
        return Math.ceil(data.commits.length / commitsPerPage);
    }, [data?.commits, commitsPerPage]);

    const bgColor = { light: 'white', dark: 'gray.900' };
    const cardBg = { light: 'white', dark: 'gray.800' };
    const borderColor = { light: 'gray.800', dark: 'gray.600' };
    const textColor = { light: 'gray.900', dark: 'gray.100' };
    const mutedColor = { light: 'gray.600', dark: 'gray.400' };
    const accentBg = { light: 'gray.100', dark: 'gray.700' };

    const handleCopyUrl = async () => {
        const currentUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(currentUrl);
            toast({
                title: 'Link copied!',
                description: 'URL has been copied to your clipboard',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: 'Failed to copy',
                description: 'Could not copy URL to clipboard',
                status: 'error',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const handleShare = (platform: 'linkedin' | 'twitter' | 'reddit') => {
        const currentUrl = window.location.href;
        const shareText = username
            ? `Check out ${username}'s GitHub activity stats!`
            : 'Check out this GitHub Activity Dashboard!';

        let shareUrl = '';

        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'reddit':
                shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`;
                break;
        }

        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Box bg={bgColor[colorMode]} minH="100vh" py={8}>
            <Container maxW="800px">
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
                        <HStack spacing={2}>
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    aria-label="Share"
                                    icon={<Icon as={FaShare} />}
                                    variant="outline"
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                    _hover={{ bg: accentBg[colorMode] }}
                                    _active={{ bg: accentBg[colorMode] }}
                                />
                                <MenuList
                                    bg={cardBg[colorMode]}
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                >
                                    <MenuItem
                                        icon={<CopyIcon />}
                                        onClick={handleCopyUrl}
                                        bg={cardBg[colorMode]}
                                        color={textColor[colorMode]}
                                        _hover={{ bg: accentBg[colorMode] }}
                                        fontWeight="bold"
                                    >
                                        Copy URL
                                    </MenuItem>
                                    <MenuItem
                                        icon={<Icon as={FaLinkedin} color="#0A66C2" />}
                                        onClick={() => handleShare('linkedin')}
                                        bg={cardBg[colorMode]}
                                        color={textColor[colorMode]}
                                        _hover={{ bg: accentBg[colorMode] }}
                                    >
                                        Share on LinkedIn
                                    </MenuItem>
                                    <MenuItem
                                        icon={<Icon as={FaXTwitter} />}
                                        onClick={() => handleShare('twitter')}
                                        bg={cardBg[colorMode]}
                                        color={textColor[colorMode]}
                                        _hover={{ bg: accentBg[colorMode] }}
                                    >
                                        Share on X
                                    </MenuItem>
                                    <MenuItem
                                        icon={<Icon as={FaReddit} color="#FF4500" />}
                                        onClick={() => handleShare('reddit')}
                                        bg={cardBg[colorMode]}
                                        color={textColor[colorMode]}
                                        _hover={{ bg: accentBg[colorMode] }}
                                    >
                                        Share on Reddit
                                    </MenuItem>
                                </MenuList>
                            </Menu>
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

                    {/* User Profile */}
                    {data?.user && !error && (
                        <Card
                            bg={cardBg[colorMode]}
                            border="2px solid"
                            borderColor={borderColor[colorMode]}
                            boxShadow="none"
                        >
                            <CardBody>
                                <HStack spacing={6} align="start">
                                    <Avatar
                                        size="2xl"
                                        src={data.user.avatar_url}
                                        name={data.user.name ?? data.user.login}
                                        border="2px solid"
                                        borderColor={borderColor[colorMode]}
                                    />
                                    <VStack align="start" spacing={3} flex={1}>
                                        <Box>
                                            <Heading
                                                size="lg"
                                                color={textColor[colorMode]}
                                                fontWeight="bold"
                                            >
                                                {data.user.name ?? data.user.login}
                                            </Heading>
                                            <Text
                                                color={mutedColor[colorMode]}
                                                fontSize="md"
                                                fontWeight="bold"
                                            >
                                                @{data.user.login}
                                            </Text>
                                        </Box>
                                        {data.user.bio && (
                                            <Text color={textColor[colorMode]}>
                                                {data.user.bio}
                                            </Text>
                                        )}
                                        <HStack spacing={4} flexWrap="wrap">
                                            <HStack>
                                                <Text
                                                    color={textColor[colorMode]}
                                                    fontWeight="bold"
                                                >
                                                    {data.user.public_repos}
                                                </Text>
                                                <Text color={mutedColor[colorMode]}>
                                                    repositories
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text
                                                    color={textColor[colorMode]}
                                                    fontWeight="bold"
                                                >
                                                    {data.user.followers}
                                                </Text>
                                                <Text color={mutedColor[colorMode]}>followers</Text>
                                            </HStack>
                                            <HStack>
                                                <Text
                                                    color={textColor[colorMode]}
                                                    fontWeight="bold"
                                                >
                                                    {data.user.following}
                                                </Text>
                                                <Text color={mutedColor[colorMode]}>following</Text>
                                            </HStack>
                                        </HStack>
                                        <HStack spacing={3} flexWrap="wrap">
                                            <Button
                                                as={Link}
                                                href={data.user.html_url}
                                                isExternal
                                                size="sm"
                                                bg={textColor[colorMode]}
                                                color={bgColor[colorMode]}
                                                border="2px solid"
                                                borderColor={borderColor[colorMode]}
                                                boxShadow="none"
                                                rightIcon={<ExternalLinkIcon />}
                                                _hover={{
                                                    bg: accentBg[colorMode],
                                                    color: textColor[colorMode],
                                                    textDecoration: 'none',
                                                }}
                                                _active={{ bg: accentBg[colorMode] }}
                                            >
                                                View GitHub Profile
                                            </Button>
                                            {data.user.blog && (
                                                <Button
                                                    as={Link}
                                                    href={
                                                        data.user.blog.startsWith('http')
                                                            ? data.user.blog
                                                            : `https://${data.user.blog}`
                                                    }
                                                    isExternal
                                                    size="sm"
                                                    variant="outline"
                                                    border="2px solid"
                                                    borderColor={borderColor[colorMode]}
                                                    color={textColor[colorMode]}
                                                    boxShadow="none"
                                                    rightIcon={<ExternalLinkIcon />}
                                                    _hover={{
                                                        bg: accentBg[colorMode],
                                                        textDecoration: 'none',
                                                    }}
                                                    _active={{ bg: accentBg[colorMode] }}
                                                >
                                                    Website
                                                </Button>
                                            )}
                                            {data.user.twitter_username && (
                                                <Button
                                                    as={Link}
                                                    href={`https://twitter.com/${data.user.twitter_username}`}
                                                    isExternal
                                                    size="sm"
                                                    variant="outline"
                                                    border="2px solid"
                                                    borderColor={borderColor[colorMode]}
                                                    color={textColor[colorMode]}
                                                    boxShadow="none"
                                                    leftIcon={<Icon as={FaXTwitter} />}
                                                    _hover={{
                                                        bg: accentBg[colorMode],
                                                        textDecoration: 'none',
                                                    }}
                                                    _active={{ bg: accentBg[colorMode] }}
                                                >
                                                    @{data.user.twitter_username}
                                                </Button>
                                            )}
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    )}

                    {/* Date Range Selector */}
                    {data?.user && !error && (
                        <Card
                            bg={cardBg[colorMode]}
                            border="2px solid"
                            borderColor={borderColor[colorMode]}
                            boxShadow="none"
                        >
                            <CardBody>
                                <HStack spacing={3} flexWrap="wrap">
                                    {(Object.keys(DATE_RANGES) as DateRange[]).map((range) => (
                                        <Button
                                            key={range}
                                            size="sm"
                                            bg={
                                                selectedRange === range
                                                    ? textColor[colorMode]
                                                    : 'transparent'
                                            }
                                            color={
                                                selectedRange === range
                                                    ? bgColor[colorMode]
                                                    : textColor[colorMode]
                                            }
                                            border="2px solid"
                                            borderColor={borderColor[colorMode]}
                                            boxShadow="none"
                                            _hover={{
                                                bg:
                                                    selectedRange === range
                                                        ? textColor[colorMode]
                                                        : accentBg[colorMode],
                                            }}
                                            _active={{
                                                bg:
                                                    selectedRange === range
                                                        ? textColor[colorMode]
                                                        : accentBg[colorMode],
                                            }}
                                            onClick={() => handleRangeChange(range)}
                                        >
                                            {DATE_RANGES[range].label}
                                        </Button>
                                    ))}
                                </HStack>
                            </CardBody>
                        </Card>
                    )}

                    {/* Empty State - No Username */}
                    {(!username || username.length === 0) && !isFetching && !data && (
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
                                            Enter a GitHub username above to view their commit
                                            activity and statistics
                                        </Text>
                                    </VStack>
                                </Center>
                            </CardBody>
                        </Card>
                    )}

                    {/* Loading State */}
                    {isFetching && (
                        <Center py={12}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color={textColor[colorMode]} thickness="4px" />
                                <Text color={mutedColor[colorMode]}>
                                    Loading your GitHub activity...
                                </Text>
                            </VStack>
                        </Center>
                    )}

                    {/* Error State */}
                    {error && !isFetching && (
                        <Card
                            bg={cardBg[colorMode]}
                            border="2px solid"
                            borderColor="red.500"
                            boxShadow="none"
                        >
                            <CardBody>
                                <Center py={8}>
                                    <VStack spacing={3}>
                                        <Box fontSize="4xl" color="red.500">
                                            ⚠️
                                        </Box>
                                        <Heading size="md" color="red.500" fontWeight="bold">
                                            Error Loading Profile
                                        </Heading>
                                        <Text color="red.500" textAlign="center" maxW="400px">
                                            {error.message}
                                        </Text>
                                        <Text
                                            color={mutedColor[colorMode]}
                                            fontSize="sm"
                                            textAlign="center"
                                            maxW="400px"
                                        >
                                            Please check the username and try again.
                                        </Text>
                                    </VStack>
                                </Center>
                            </CardBody>
                        </Card>
                    )}

                    {/* Data Display */}
                    {data && !error && (
                        <>
                            {/* Info Note */}
                            <Card
                                bg={accentBg[colorMode]}
                                border="2px solid"
                                borderColor={borderColor[colorMode]}
                                boxShadow="none"
                            >
                                <CardBody py={3}>
                                    <HStack spacing={2}>
                                        <Text fontSize="sm" color={mutedColor[colorMode]}>
                                            ℹ️
                                        </Text>
                                        <Text fontSize="sm" color={mutedColor[colorMode]}>
                                            Stats show public repository contributions only. Private
                                            repository contributions are not included.
                                        </Text>
                                    </HStack>
                                </CardBody>
                            </Card>

                            {/* Summary Stats */}
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                <Card
                                    bg={cardBg[colorMode]}
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                >
                                    <CardBody>
                                        <Stat>
                                            <StatLabel
                                                color={mutedColor[colorMode]}
                                                fontWeight="bold"
                                            >
                                                Total Commits
                                            </StatLabel>
                                            <StatNumber
                                                color={textColor[colorMode]}
                                                fontSize="3xl"
                                                fontWeight="black"
                                            >
                                                {data.totalCommits}
                                            </StatNumber>
                                            <StatHelpText color={mutedColor[colorMode]}>
                                                {DATE_RANGES[selectedRange].label}
                                            </StatHelpText>
                                        </Stat>
                                    </CardBody>
                                </Card>

                                <Card
                                    bg={cardBg[colorMode]}
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                >
                                    <CardBody>
                                        <Stat>
                                            <StatLabel
                                                color={mutedColor[colorMode]}
                                                fontWeight="bold"
                                            >
                                                Repositories
                                            </StatLabel>
                                            <StatNumber
                                                color={textColor[colorMode]}
                                                fontSize="3xl"
                                                fontWeight="black"
                                            >
                                                {data.summary.totalRepositories}
                                            </StatNumber>
                                            <StatHelpText color={mutedColor[colorMode]}>
                                                Active repositories
                                            </StatHelpText>
                                        </Stat>
                                    </CardBody>
                                </Card>

                                <Card
                                    bg={cardBg[colorMode]}
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                >
                                    <CardBody>
                                        <Stat>
                                            <StatLabel
                                                color={mutedColor[colorMode]}
                                                fontWeight="bold"
                                            >
                                                Avg. Commits/Day
                                            </StatLabel>
                                            <StatNumber
                                                color={textColor[colorMode]}
                                                fontSize="3xl"
                                                fontWeight="black"
                                            >
                                                {data.summary.averageCommitsPerDay}
                                            </StatNumber>
                                            <StatHelpText color={mutedColor[colorMode]}>
                                                Daily average
                                            </StatHelpText>
                                        </Stat>
                                    </CardBody>
                                </Card>

                                <Card
                                    bg={cardBg[colorMode]}
                                    border="2px solid"
                                    borderColor={borderColor[colorMode]}
                                    boxShadow="none"
                                >
                                    <CardBody>
                                        <Stat>
                                            <StatLabel
                                                color={mutedColor[colorMode]}
                                                fontWeight="bold"
                                            >
                                                Most Active Day
                                            </StatLabel>
                                            <StatNumber
                                                color={textColor[colorMode]}
                                                fontSize="3xl"
                                                fontWeight="black"
                                            >
                                                {data.summary.mostActiveDay.count}
                                            </StatNumber>
                                            <StatHelpText color={mutedColor[colorMode]}>
                                                {data.summary.mostActiveDay.date
                                                    ? dayjs(data.summary.mostActiveDay.date).format(
                                                          'MMM D, YYYY'
                                                      )
                                                    : 'N/A'}
                                            </StatHelpText>
                                        </Stat>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            {/* Top Repositories */}
                            <Card
                                bg={cardBg[colorMode]}
                                border="2px solid"
                                borderColor={borderColor[colorMode]}
                                boxShadow="none"
                            >
                                <CardHeader>
                                    <Heading
                                        size="md"
                                        color={textColor[colorMode]}
                                        fontWeight="bold"
                                    >
                                        Top Repositories
                                    </Heading>
                                </CardHeader>
                                <Divider borderColor={borderColor[colorMode]} />
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        {data.topRepositories.length === 0 ? (
                                            <Text color={mutedColor[colorMode]}>
                                                No repository activity found
                                            </Text>
                                        ) : (
                                            data.topRepositories.map((repo) => (
                                                <Box
                                                    key={repo.name}
                                                    p={4}
                                                    bg={accentBg[colorMode]}
                                                    border="2px solid"
                                                    borderColor={borderColor[colorMode]}
                                                    _hover={{ bg: cardBg[colorMode] }}
                                                >
                                                    <HStack justify="space-between" align="start">
                                                        <VStack align="start" spacing={1} flex={1}>
                                                            <HStack>
                                                                <Link
                                                                    href={repo.url}
                                                                    isExternal
                                                                    fontWeight="bold"
                                                                    color={textColor[colorMode]}
                                                                    _hover={{
                                                                        textDecoration: 'underline',
                                                                    }}
                                                                >
                                                                    {repo.name}
                                                                    <ExternalLinkIcon mx={1} />
                                                                </Link>
                                                            </HStack>
                                                            {repo.description && (
                                                                <Text
                                                                    fontSize="sm"
                                                                    color={mutedColor[colorMode]}
                                                                >
                                                                    {repo.description}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                        <Badge
                                                            bg={textColor[colorMode]}
                                                            color={bgColor[colorMode]}
                                                            fontSize="md"
                                                            px={3}
                                                            py={1}
                                                            border="2px solid"
                                                            borderColor={borderColor[colorMode]}
                                                            fontWeight="bold"
                                                        >
                                                            {repo.commitCount}{' '}
                                                            {repo.commitCount === 1
                                                                ? 'commit'
                                                                : 'commits'}
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                            ))
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Activity Timeline */}
                            <Card
                                bg={cardBg[colorMode]}
                                border="2px solid"
                                borderColor={borderColor[colorMode]}
                                boxShadow="none"
                            >
                                <CardHeader>
                                    <Heading
                                        size="md"
                                        color={textColor[colorMode]}
                                        fontWeight="bold"
                                    >
                                        Daily Activity
                                    </Heading>
                                </CardHeader>
                                <Divider borderColor={borderColor[colorMode]} />
                                <CardBody>
                                    {data.activityByDay.length === 0 ? (
                                        <Text color={mutedColor[colorMode]}>
                                            No activity found in this period
                                        </Text>
                                    ) : (
                                        <VStack spacing={2} align="stretch">
                                            {data.activityByDay.map((day) => {
                                                const maxCommits = Math.max(
                                                    ...data.activityByDay.map((d) => d.count)
                                                );
                                                const widthPercent = (day.count / maxCommits) * 100;

                                                return (
                                                    <HStack
                                                        key={day.date}
                                                        spacing={4}
                                                        align="center"
                                                    >
                                                        <Text
                                                            fontSize="sm"
                                                            color={mutedColor[colorMode]}
                                                            minW="100px"
                                                            textAlign="right"
                                                            fontWeight="bold"
                                                        >
                                                            {dayjs(day.date).format('MMM D')}
                                                        </Text>
                                                        <Box flex={1} position="relative">
                                                            <Box
                                                                bg={textColor[colorMode]}
                                                                h="24px"
                                                                border="2px solid"
                                                                borderColor={borderColor[colorMode]}
                                                                width={`${widthPercent}%`}
                                                                minW="50px"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="flex-end"
                                                                pr={2}
                                                            >
                                                                <Text
                                                                    fontSize="sm"
                                                                    color={bgColor[colorMode]}
                                                                    fontWeight="bold"
                                                                >
                                                                    {day.count}
                                                                </Text>
                                                            </Box>
                                                        </Box>
                                                    </HStack>
                                                );
                                            })}
                                        </VStack>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Recent Commits */}
                            <Card
                                bg={cardBg[colorMode]}
                                border="2px solid"
                                borderColor={borderColor[colorMode]}
                                boxShadow="none"
                            >
                                <CardHeader>
                                    <HStack justify="space-between" align="center">
                                        <Heading
                                            size="md"
                                            color={textColor[colorMode]}
                                            fontWeight="bold"
                                        >
                                            Recent Commits
                                        </Heading>
                                        {data.commits.length > 0 && (
                                            <Text fontSize="sm" color={mutedColor[colorMode]}>
                                                {data.commits.length} total
                                            </Text>
                                        )}
                                    </HStack>
                                </CardHeader>
                                <Divider borderColor={borderColor[colorMode]} />
                                <CardBody>
                                    <VStack spacing={3} align="stretch">
                                        {data.commits.length === 0 ? (
                                            <Text color={mutedColor[colorMode]}>
                                                No commits found
                                            </Text>
                                        ) : (
                                            <>
                                                {paginatedCommits.map((commit) => (
                                                    <Box
                                                        key={commit.sha}
                                                        p={3}
                                                        bg={accentBg[colorMode]}
                                                        border="2px solid"
                                                        borderColor={borderColor[colorMode]}
                                                        borderLeft="4px solid"
                                                        borderLeftColor={textColor[colorMode]}
                                                    >
                                                        <VStack align="start" spacing={1}>
                                                            <HStack
                                                                justify="space-between"
                                                                w="full"
                                                            >
                                                                <Link
                                                                    href={commit.html_url}
                                                                    isExternal
                                                                    fontSize="sm"
                                                                    fontWeight="bold"
                                                                    color={textColor[colorMode]}
                                                                    _hover={{
                                                                        textDecoration: 'underline',
                                                                    }}
                                                                >
                                                                    {commit.repository.name}
                                                                </Link>
                                                                <Text
                                                                    fontSize="xs"
                                                                    color={mutedColor[colorMode]}
                                                                    fontWeight="bold"
                                                                >
                                                                    {dayjs(
                                                                        commit.commit.author.date
                                                                    ).format('MMM D, h:mm A')}
                                                                </Text>
                                                            </HStack>
                                                            <Text
                                                                fontSize="sm"
                                                                noOfLines={2}
                                                                color={textColor[colorMode]}
                                                            >
                                                                {
                                                                    commit.commit.message.split(
                                                                        '\n'
                                                                    )[0]
                                                                }
                                                            </Text>
                                                            <Text
                                                                fontSize="xs"
                                                                color={mutedColor[colorMode]}
                                                                fontFamily="mono"
                                                                fontWeight="bold"
                                                            >
                                                                {commit.sha.substring(0, 7)}
                                                            </Text>
                                                        </VStack>
                                                    </Box>
                                                ))}

                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <HStack
                                                        justify="space-between"
                                                        align="center"
                                                        pt={2}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                setCurrentPage((prev) =>
                                                                    Math.max(1, prev - 1)
                                                                )
                                                            }
                                                            isDisabled={currentPage === 1}
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
                                                            _disabled={{
                                                                opacity: 0.4,
                                                                cursor: 'not-allowed',
                                                                bg: accentBg[colorMode],
                                                                color: mutedColor[colorMode],
                                                            }}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Text
                                                            fontSize="sm"
                                                            color={textColor[colorMode]}
                                                            fontWeight="bold"
                                                        >
                                                            Page {currentPage} of {totalPages}
                                                        </Text>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                setCurrentPage((prev) =>
                                                                    Math.min(totalPages, prev + 1)
                                                                )
                                                            }
                                                            isDisabled={currentPage === totalPages}
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
                                                            _disabled={{
                                                                opacity: 0.4,
                                                                cursor: 'not-allowed',
                                                                bg: accentBg[colorMode],
                                                                color: mutedColor[colorMode],
                                                            }}
                                                        >
                                                            Next
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </>
                    )}
                </VStack>
            </Container>
        </Box>
    );
}
