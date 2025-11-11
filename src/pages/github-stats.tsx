import { ExternalLinkIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
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
} from '@chakra-ui/react';
import { FaLinkedin, FaReddit, FaShare, FaXTwitter } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

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
    const { colorMode, toggleColorMode } = useColorMode();
    const [selectedRange, setSelectedRange] = useState<DateRange>('7days');
    const [username, setUsername] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const commitsPerPage = 10;

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

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
    });

    console.log('username:', username.length);

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            const trimmedUsername = inputValue.trim();
            setUsername(trimmedUsername);
            setCurrentPage(1); // Reset to first page when changing username
            saveRecentSearch(trimmedUsername);
            setRecentSearches(getRecentSearches());
        }
    };

    const handleRecentSearchClick = (searchUsername: string) => {
        setInputValue(searchUsername);
        setUsername(searchUsername);
        setCurrentPage(1);
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
                                        </HStack>
                                    </Box>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Date Range Selector */}
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
                                        onClick={() => {
                                            setSelectedRange(range);
                                            setCurrentPage(1); // Reset to first page when changing date range
                                        }}
                                    >
                                        {DATE_RANGES[range].label}
                                    </Button>
                                ))}
                            </HStack>
                        </CardBody>
                    </Card>

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
                    {error && (
                        <Card
                            bg={cardBg[colorMode]}
                            border="2px solid"
                            borderColor="red.500"
                            boxShadow="none"
                        >
                            <CardBody>
                                <Text color="red.500" fontWeight="bold">
                                    Error loading GitHub data: {error.message}
                                </Text>
                            </CardBody>
                        </Card>
                    )}

                    {/* Data Display */}
                    {data && (
                        <>
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
                                                {DATE_RANGES[selectedRange].label.toLowerCase()}
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
                                                                minW="30px"
                                                            />
                                                        </Box>
                                                        <Text
                                                            fontSize="sm"
                                                            color={textColor[colorMode]}
                                                            fontWeight="bold"
                                                            minW="30px"
                                                            textAlign="right"
                                                        >
                                                            {day.count}
                                                        </Text>
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
