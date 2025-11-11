# GitHub App Quick Start

**TL;DR**: Create a GitHub App and add 3 values to your `.env` file.

## What You Need

1. **App ID** - A number (e.g., `123456`)
2. **Installation ID** - A number (e.g., `12345678`)
3. **Private Key** - A `.pem` file content

## Quick Steps

### 1. Create GitHub App
Visit: https://github.com/settings/apps/new

**Required Settings:**
- Name: `GitHub Stats App` (or any unique name)
- Homepage URL: `http://localhost:3000`
- Webhook: ✗ Uncheck "Active"
- **Permissions:**
  - Repository → Contents: `Read-only`
- Where to install: `Only on this account`

Click **"Create GitHub App"**

### 2. Get App ID
At the top of your app's page, copy the **App ID** number.

### 3. Generate Private Key
1. Scroll to "Private keys" section
2. Click **"Generate a private key"**
3. Save the downloaded `.pem` file

### 4. Install the App
1. Click **"Install App"** in the left sidebar
2. Choose your account
3. Select **"All repositories"**
4. Click **"Install"**

### 5. Get Installation ID
After installing, look at the URL:
```
https://github.com/settings/installations/12345678
                                         ^^^^^^^^
                                    This is your Installation ID
```

### 6. Configure `.env`

```bash
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=12345678
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Paste your entire .pem file content here
Keep the line breaks as-is
-----END RSA PRIVATE KEY-----"
```

### 7. Start Your App

```bash
pnpm dev
```

Visit: http://localhost:3000/github-stats

## That's It!

For detailed troubleshooting and explanations, see [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md)

## Common Issues

**Error: "GitHub App not configured"**
→ Check all 3 env vars are set in `.env`

**Error: "Authentication failed"**
→ Verify your App ID and private key are correct

**Error: "404 Not Found"**
→ Make sure the app is installed on your account
