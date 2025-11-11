# GitHub App Setup Guide

This application uses a **GitHub App** for authentication instead of Personal Access Tokens. GitHub Apps provide better security, higher rate limits, and more granular permissions.

## Benefits of GitHub Apps

- **Higher Rate Limits**: 5,000 requests per hour per installation
- **Better Security**: Private keys instead of tokens, automatic token rotation
- **Granular Permissions**: Only request the permissions you need
- **Organization-wide**: Can be installed across multiple repositories
- **Audit Trail**: Better tracking of API usage

---

## Step-by-Step Setup Instructions

### Step 1: Create a New GitHub App

1. Go to your GitHub account settings:
   - **For Personal Account**: https://github.com/settings/apps
   - **For Organization**: https://github.com/organizations/YOUR-ORG/settings/apps

2. Click **"New GitHub App"** button

### Step 2: Configure Basic Information

Fill in the following fields:

- **GitHub App name**: `GitHub Stats App` (or any name you prefer)
  - This name must be unique across all of GitHub

- **Homepage URL**: Your application URL (e.g., `http://localhost:3000` for development or your production URL)

- **Webhook**:
  - **Uncheck** "Active" (we don't need webhooks for this app)

### Step 3: Set Permissions

Scroll down to the **"Permissions"** section and configure:

#### Repository permissions:
- **Contents**: `Read-only` (to read commit data)
- **Metadata**: `Read-only` (automatically selected, required)

#### Account permissions:
- Leave all as "No access"

**Note**: These are the minimum permissions needed to search for commits.

### Step 4: Configure Installation

Scroll down to **"Where can this GitHub App be installed?"**

Choose one of:
- **Only on this account** (recommended for personal use)
- **Any account** (if you want to allow others to install it)

### Step 5: Create the App

1. Click **"Create GitHub App"** button at the bottom
2. You'll be redirected to your new app's settings page

### Step 6: Generate a Private Key

1. On your app's settings page, scroll down to **"Private keys"** section
2. Click **"Generate a private key"**
3. A `.pem` file will be downloaded to your computer
4. **Keep this file safe!** You'll need it for the next step

### Step 7: Get Your App ID

1. At the top of your app's settings page, you'll see **"App ID"**
2. Copy this number (e.g., `123456`)

### Step 8: Install the App

1. On your app's settings page, click **"Install App"** in the left sidebar
2. Choose the account where you want to install it
3. Select repository access:
   - **All repositories** (recommended for complete stats)
   - **Only select repositories** (if you want to limit access)
4. Click **"Install"**

### Step 9: Get Installation ID

After installing, you'll be redirected to a URL like:
```
https://github.com/settings/installations/12345678
```

The number at the end (`12345678`) is your **Installation ID**. Copy this number.

---

## Step 10: Configure Your Application

Now you need to add three values to your `.env` file:

### 1. Add App ID
```bash
GITHUB_APP_ID=123456
```

### 2. Add Installation ID
```bash
GITHUB_APP_INSTALLATION_ID=12345678
```

### 3. Add Private Key

Open the `.pem` file you downloaded earlier. It will look like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(many lines of text)
...lots of characters...
-----END RSA PRIVATE KEY-----
```

You have **two options** for adding this to your `.env` file:

#### Option A: Single line with \n (Recommended for production)
```bash
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n...\n-----END RSA PRIVATE KEY-----\n"
```

Replace all actual newlines with `\n` characters.

#### Option B: Multi-line (Easier for development)
```bash
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(keep the actual line breaks)
...
-----END RSA PRIVATE KEY-----"
```

**Important**: Keep the double quotes around the entire key!

---

## Step 11: Verify Your Configuration

Your `.env` file should now look like this:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=12345678
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----"
```

---

## Step 12: Test Your Setup

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Visit `http://localhost:3000/github-stats`

3. If everything is configured correctly, you should be able to fetch GitHub stats!

---

## Troubleshooting

### "GitHub App not configured" error
- Check that all three environment variables are set in `.env`
- Ensure there are no extra spaces or quotes
- Verify the private key has proper line breaks or `\n` characters

### "Authentication failed" error
- Verify your App ID is correct
- Check that the private key is complete (including BEGIN and END lines)
- Ensure the app is installed on your account

### "404 Not Found" error
- Check that your Installation ID is correct
- Verify the app has access to search commits (Contents: Read permission)
- Make sure the app is actually installed

### Rate limit errors
- Even with GitHub App, you can hit rate limits with heavy usage
- Check your app's rate limit status at: `https://api.github.com/rate_limit`
- Consider implementing caching if needed

---

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. **Rotate keys** periodically (generate new private key in app settings)
3. **Use minimum permissions** - only request what you need
4. **Monitor usage** - GitHub provides audit logs for app activities
5. **Revoke immediately** if compromised - delete the private key in app settings

---

## Rate Limits

With GitHub App authentication:
- **5,000 requests per hour** per installation
- Shared across all users of your app
- Resets every hour

Your app also has IP-based rate limiting (10 requests per 15 minutes per IP) to prevent abuse.

---

## Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Authenticating with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)

---

## Need Help?

If you run into issues:
1. Check the application logs for detailed error messages
2. Verify all three environment variables are set correctly
3. Ensure your GitHub App has the correct permissions
4. Check that the app is installed on your account
