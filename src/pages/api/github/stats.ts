import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { rateLimit } from "@/lib/rate-limit";

// Rate limiter: 10 requests per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 unique IPs tracked
  maxRequests: 10, // 10 requests per interval
});

interface GitHubCommit {
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
    html_url: string;
    description: string | null;
  };
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubCommit[];
}

interface GitHubStatsResponse {
  commits: GitHubCommit[];
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

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0]
    : req.socket.remoteAddress;
  return ip ?? "unknown";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get client IP for rate limiting
  const clientIp = getClientIp(req);

  // Check rate limit
  const rateLimitResult = limiter.check(clientIp);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString());

  if (!rateLimitResult.success) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please try again later.",
      retryAfter: new Date(rateLimitResult.reset).toISOString(),
    });
  }

  // Validate required parameters
  const { username, startDate, endDate } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!startDate || typeof startDate !== "string") {
    return res.status(400).json({ error: "Start date is required" });
  }

  if (!endDate || typeof endDate !== "string") {
    return res.status(400).json({ error: "End date is required" });
  }

  // Check for GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error("GITHUB_TOKEN is not set in environment variables");
    return res.status(500).json({ error: "GitHub integration not configured" });
  }

  try {
    // Use GitHub Search API to find commits by the user
    const searchQuery = `author:${username} author-date:${startDate}..${endDate}`;
    const searchResponse = await axios.get<GitHubSearchResponse>(
      `https://api.github.com/search/commits?q=${encodeURIComponent(searchQuery)}&sort=author-date&order=desc&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.cloak-preview+json",
          Authorization: `token ${githubToken}`,
          "User-Agent": "GitHub-Stats-App",
        },
      }
    );

    const commits = searchResponse.data.items;
    const totalCommits = searchResponse.data.total_count;

    // Process commits for statistics
    const repoCommitCounts = new Map<string, number>();
    const repoDetails = new Map<
      string,
      { url: string; description: string | null }
    >();
    const dailyCounts = new Map<string, number>();

    for (const commit of commits) {
      const repoFullName = commit.repository.full_name;
      const repoUrl = commit.repository.html_url;
      const commitDate = new Date(commit.commit.author.date)
        .toISOString()
        .split("T")[0];

      if (!repoDetails.has(repoFullName)) {
        repoDetails.set(repoFullName, {
          url: repoUrl,
          description: commit.repository.description,
        });
      }

      repoCommitCounts.set(
        repoFullName,
        (repoCommitCounts.get(repoFullName) ?? 0) + 1
      );
      dailyCounts.set(commitDate!, (dailyCounts.get(commitDate!) ?? 0) + 1);
    }

    // Calculate summary statistics
    const totalRepositories = repoCommitCounts.size;
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const days = Math.max(
      1,
      Math.ceil(
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const averageCommitsPerDay = (totalCommits / days).toFixed(1);

    // Find most active day
    let mostActiveDay = { date: null as string | null, count: 0 };
    dailyCounts.forEach((count, date) => {
      if (count > mostActiveDay.count) {
        mostActiveDay = { date, count };
      }
    });

    // Get top repositories
    const topRepositories = Array.from(repoCommitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => {
        const details = repoDetails.get(name);
        return {
          name: name.split("/")[1] ?? name,
          url: details?.url ?? `https://github.com/${name}`,
          description: details?.description ?? null,
          commitCount: count,
        };
      });

    // Get activity by day
    const activityByDay = Array.from(dailyCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const response: GitHubStatsResponse = {
      commits: commits.slice(0, 50), // Limit to 50 most recent
      totalCommits,
      summary: {
        totalRepositories,
        averageCommitsPerDay,
        mostActiveDay,
      },
      topRepositories,
      activityByDay,
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    console.error("GitHub API error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: "GitHub user not found" });
      }

      if (error.response?.status === 403) {
        return res.status(403).json({
          error: "GitHub API rate limit exceeded. Please try again later."
        });
      }

      const errorMessage = (error.response?.data as { message?: string })?.message;
      if (errorMessage) {
        return res.status(error.response?.status ?? 500).json({ error: errorMessage });
      }
    }

    return res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
}
