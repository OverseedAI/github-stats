# GitHub Stats Setup Guide

## Overview

The GitHub stats feature has been configured with:
- **Backend API route** for secure GitHub API calls
- **IP-based rate limiting** to prevent abuse
- **Server-side authentication** to protect your GitHub token

## Rate Limiting

The API implements the following rate limits per IP address:
- **10 requests per 15 minutes**
- Tracks up to **500 unique IPs**
- Returns standard rate limit headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: When the rate limit resets (ISO 8601 timestamp)

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitHub Stats App")
4. **No scopes needed** for accessing public repository data
5. Click "Generate token" and copy the token

### 2. Add Token to Environment

Add your GitHub token to the `.env` file:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

**Important**: Never commit this token to version control!

### 3. Restart Your Development Server

```bash
pnpm dev
```

## Architecture

### Backend API Route
- **Endpoint**: `/api/github/stats`
- **Method**: GET
- **Parameters**:
  - `username` (required): GitHub username
  - `startDate` (required): Start date in YYYY-MM-DD format
  - `endDate` (required): End date in YYYY-MM-DD format

### Rate Limit Settings

You can adjust the rate limits in `/src/pages/api/github/stats.ts`:

```typescript
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes (in milliseconds)
  uniqueTokenPerInterval: 500, // Max unique IPs to track
  maxRequests: 10, // Requests per interval
});
```

### Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing parameters)
- `404`: GitHub user not found
- `405`: Method not allowed (only GET is supported)
- `429`: Rate limit exceeded
- `500`: Server error or GitHub API issue

## GitHub API Rate Limits

With authentication:
- **5,000 requests per hour** to GitHub API
- Much more generous than the 60 requests/hour for unauthenticated requests

## Security Notes

- The GitHub token is stored server-side only
- Frontend makes requests to your backend API, not directly to GitHub
- IP-based rate limiting prevents abuse
- Token is never exposed to the client/browser
