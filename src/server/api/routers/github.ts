import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  repository: {
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
  };
  html_url: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubCommit[];
}

export const githubRouter = createTRPCRouter({
  getCommits: publicProcedure
    .input(
      z.object({
        username: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { username, startDate, endDate } = input;

      // Build the date query for GitHub Search API
      const dateQuery = endDate
        ? `committer-date:${startDate}..${endDate}`
        : `committer-date:>=${startDate}`;

      // Use GitHub Search Commits API
      const query = `author:${username} ${dateQuery}`;
      const url = `https://api.github.com/search/commits?q=${encodeURIComponent(query)}&per_page=100&sort=committer-date&order=desc`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.cloak-preview+json",
          "User-Agent": "GitHub-Stats-App",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      interface GitHubSearchResponse {
        total_count: number;
        incomplete_results: boolean;
        items: GitHubCommit[];
      }

      const data = (await response.json()) as GitHubSearchResponse;
      const commits = data.items;

      // Process and summarize the data
      const repositories = new Map<
        string,
        { name: string; url: string; commitCount: number; description: string | null }
      >();
      const dailyActivity = new Map<string, number>();

      commits.forEach((commit) => {
        // Count commits per repository
        const repoName = commit.repository.full_name;
        if (!repositories.has(repoName)) {
          repositories.set(repoName, {
            name: repoName,
            url: commit.repository.html_url,
            commitCount: 0,
            description: commit.repository.description,
          });
        }
        const repo = repositories.get(repoName)!;
        repo.commitCount++;

        // Count daily activity
        const commitDate = new Date(commit.commit.author.date)
          .toISOString()
          .split("T")[0]!;
        dailyActivity.set(commitDate, (dailyActivity.get(commitDate) || 0) + 1);
      });

      // Convert maps to sorted arrays
      const topRepositories = Array.from(repositories.values()).sort(
        (a, b) => b.commitCount - a.commitCount,
      );

      const activityByDay = Array.from(dailyActivity.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalCommits: data.total_count,
        commits: commits.slice(0, 10), // Return only the 10 most recent
        topRepositories,
        activityByDay,
        summary: {
          totalRepositories: repositories.size,
          averageCommitsPerDay:
            activityByDay.length > 0
              ? Math.round(data.total_count / activityByDay.length)
              : 0,
          mostActiveDay: activityByDay.reduce(
            (max, day) => (day.count > max.count ? day : max),
            activityByDay[0] || { date: "", count: 0 },
          ),
        },
      };
    }),
});