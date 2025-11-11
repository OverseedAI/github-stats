import { App } from "@octokit/app";

let appInstance: App | null = null;

export function getGitHubApp() {
  if (appInstance) {
    return appInstance;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    throw new Error(
      "Missing required GitHub App configuration. Please set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_INSTALLATION_ID in your environment variables."
    );
  }

  // Replace escaped newlines with actual newlines in the private key
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  appInstance = new App({
    appId,
    privateKey: formattedPrivateKey,
  });

  return appInstance;
}

export async function getInstallationOctokit() {
  const app = getGitHubApp();
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!installationId) {
    throw new Error("GITHUB_APP_INSTALLATION_ID is not set");
  }

  return await app.getInstallationOctokit(parseInt(installationId, 10));
}
