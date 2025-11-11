import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Spinner,
  Center,
  Badge,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type DateRange = "7days" | "30days" | "90days" | "1year";

const DATE_RANGES: Record<
  DateRange,
  { label: string; days: number }
> = {
  "7days": { label: "Last 7 days", days: 7 },
  "30days": { label: "Last 30 days", days: 30 },
  "90days": { label: "Last 90 days", days: 90 },
  "1year": { label: "Last year", days: 365 },
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
      throw new Error("GitHub user not found");
    }
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (axios.isAxiosError(error)) {
      const errorMessage = (error.response?.data as { error?: string })?.error;
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    }
    throw new Error("Failed to fetch GitHub data");
  }
}

export default function GitHubStatsPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [selectedRange, setSelectedRange] = useState<DateRange>("7days");
  const [username, setUsername] = useState("hal-shin");
  const [inputValue, setInputValue] = useState("hal-shin");
  const [currentPage, setCurrentPage] = useState(1);
  const commitsPerPage = 10;

  const { startDate, endDate } = useMemo(() => {
    const days = DATE_RANGES[selectedRange].days;
    const end = dayjs();
    const start = end.subtract(days, "day");

    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
    };
  }, [selectedRange]);

  const { data, isLoading, error } = useQuery<GitHubData, Error>({
    queryKey: ["github-commits", username, startDate, endDate],
    queryFn: () => fetchGitHubCommits(username, startDate, endDate),
    enabled: !!username,
    retry: 1,
  });

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUsername(inputValue.trim());
    }
  };

  const bgColor = { light: "white", dark: "gray.900" };
  const cardBg = { light: "white", dark: "gray.800" };
  const borderColor = { light: "gray.800", dark: "gray.600" };
  const textColor = { light: "gray.900", dark: "gray.100" };
  const mutedColor = { light: "gray.600", dark: "gray.400" };
  const accentBg = { light: "gray.100", dark: "gray.700" };

  return (
    <Box bg={bgColor[colorMode]} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <Box>
              <Heading size="xl" mb={2} color={textColor[colorMode]} fontWeight="bold">
                GitHub Activity Dashboard
              </Heading>
              <Text color={mutedColor[colorMode]}>
                Overview of your recent contributions and commit activity
              </Text>
            </Box>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
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
              <form onSubmit={handleUsernameSubmit}>
                <HStack spacing={3}>
                  <InputGroup flex={1} maxW="400px">
                    <InputLeftElement pointerEvents="none" color={mutedColor[colorMode]}>
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
                      _focus={{ borderColor: borderColor[colorMode], boxShadow: "none" }}
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
                    _hover={{ bg: accentBg[colorMode], color: textColor[colorMode] }}
                    _active={{ bg: accentBg[colorMode] }}
                  >
                    Load Stats
                  </Button>
                </HStack>
              </form>
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
                    bg={selectedRange === range ? textColor[colorMode] : "transparent"}
                    color={selectedRange === range ? bgColor[colorMode] : textColor[colorMode]}
                    border="2px solid"
                    borderColor={borderColor[colorMode]}
                    boxShadow="none"
                    _hover={{ bg: selectedRange === range ? textColor[colorMode] : accentBg[colorMode] }}
                    _active={{ bg: selectedRange === range ? textColor[colorMode] : accentBg[colorMode] }}
                    onClick={() => setSelectedRange(range)}
                  >
                    {DATE_RANGES[range].label}
                  </Button>
                ))}
              </HStack>
            </CardBody>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Center py={12}>
              <VStack spacing={4}>
                <Spinner size="xl" color={textColor[colorMode]} thickness="4px" />
                <Text color={mutedColor[colorMode]}>Loading your GitHub activity...</Text>
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
                      <StatLabel color={mutedColor[colorMode]} fontWeight="bold">Total Commits</StatLabel>
                      <StatNumber color={textColor[colorMode]} fontSize="3xl" fontWeight="black">{data.totalCommits}</StatNumber>
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
                      <StatLabel color={mutedColor[colorMode]} fontWeight="bold">Repositories</StatLabel>
                      <StatNumber color={textColor[colorMode]} fontSize="3xl" fontWeight="black">{data.summary.totalRepositories}</StatNumber>
                      <StatHelpText color={mutedColor[colorMode]}>Active repositories</StatHelpText>
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
                      <StatLabel color={mutedColor[colorMode]} fontWeight="bold">Avg. Commits/Day</StatLabel>
                      <StatNumber color={textColor[colorMode]} fontSize="3xl" fontWeight="black">{data.summary.averageCommitsPerDay}</StatNumber>
                      <StatHelpText color={mutedColor[colorMode]}>Daily average</StatHelpText>
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
                      <StatLabel color={mutedColor[colorMode]} fontWeight="bold">Most Active Day</StatLabel>
                      <StatNumber color={textColor[colorMode]} fontSize="3xl" fontWeight="black">{data.summary.mostActiveDay.count}</StatNumber>
                      <StatHelpText color={mutedColor[colorMode]}>
                        {data.summary.mostActiveDay.date
                          ? dayjs(data.summary.mostActiveDay.date).format(
                              "MMM D, YYYY",
                            )
                          : "N/A"}
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
                  <Heading size="md" color={textColor[colorMode]} fontWeight="bold">Top Repositories</Heading>
                </CardHeader>
                <Divider borderColor={borderColor[colorMode]} />
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {data.topRepositories.length === 0 ? (
                      <Text color={mutedColor[colorMode]}>No repository activity found</Text>
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
                                  _hover={{ textDecoration: "underline" }}
                                >
                                  {repo.name}
                                  <ExternalLinkIcon mx={1} />
                                </Link>
                              </HStack>
                              {repo.description && (
                                <Text fontSize="sm" color={mutedColor[colorMode]}>
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
                              {repo.commitCount}{" "}
                              {repo.commitCount === 1 ? "commit" : "commits"}
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
                  <Heading size="md" color={textColor[colorMode]} fontWeight="bold">Daily Activity</Heading>
                </CardHeader>
                <Divider borderColor={borderColor[colorMode]} />
                <CardBody>
                  {data.activityByDay.length === 0 ? (
                    <Text color={mutedColor[colorMode]}>No activity found in this period</Text>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      {data.activityByDay.map((day) => {
                        const maxCommits = Math.max(
                          ...data.activityByDay.map((d) => d.count),
                        );
                        const widthPercent = (day.count / maxCommits) * 100;

                        return (
                          <HStack key={day.date} spacing={4} align="center">
                            <Text
                              fontSize="sm"
                              color={mutedColor[colorMode]}
                              minW="100px"
                              textAlign="right"
                              fontWeight="bold"
                            >
                              {dayjs(day.date).format("MMM D")}
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
                  <Heading size="md" color={textColor[colorMode]} fontWeight="bold">Recent Commits</Heading>
                </CardHeader>
                <Divider borderColor={borderColor[colorMode]} />
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {data.commits.length === 0 ? (
                      <Text color={mutedColor[colorMode]}>No commits found</Text>
                    ) : (
                      data.commits.map((commit) => (
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
                            <HStack justify="space-between" w="full">
                              <Link
                                href={commit.html_url}
                                isExternal
                                fontSize="sm"
                                fontWeight="bold"
                                color={textColor[colorMode]}
                                _hover={{ textDecoration: "underline" }}
                              >
                                {commit.repository.name}
                              </Link>
                              <Text fontSize="xs" color={mutedColor[colorMode]} fontWeight="bold">
                                {dayjs(commit.commit.author.date).format(
                                  "MMM D, h:mm A",
                                )}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" noOfLines={2} color={textColor[colorMode]}>
                              {commit.commit.message.split("\n")[0]}
                            </Text>
                            <Text fontSize="xs" color={mutedColor[colorMode]} fontFamily="mono" fontWeight="bold">
                              {commit.sha.substring(0, 7)}
                            </Text>
                          </VStack>
                        </Box>
                      ))
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
