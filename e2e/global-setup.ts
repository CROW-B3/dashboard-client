import { test as setup } from '@playwright/test';

const AUTH_URL = process.env.AUTH_URL || 'https://dev.auth.crowai.dev';
const GATEWAY_URL = process.env.GATEWAY_URL || 'https://dev.api.crowai.dev';
const STORAGE_PATH = './e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const suffix = Math.random().toString(36).slice(2, 10);
  const email = `pw-${suffix}@testcrow.com`;
  const password = 'PwTest1234pass';
  const name = `PW Test ${suffix}`;

  await page.request.post(`${GATEWAY_URL}/api/v1/auth/sign-up/email`, {
    data: { email, password, name },
  });

  await page.waitForTimeout(3000);

  await page.goto(`${AUTH_URL}/login`);
  await page.locator('input[type="email"], input[name="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForTimeout(3000);

  const sessionResponse = await page.request.get(`${GATEWAY_URL}/api/v1/auth/get-session`);
  const session = await sessionResponse.json();

  if (!session?.user) {
    await page.goto(`${AUTH_URL}/login`);
    await page.locator('input[type="email"], input[name="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(3000);
  }

  await page.request.post(`${GATEWAY_URL}/api/v1/auth/organization/create`, {
    data: { name: `PW Org ${suffix}`, slug: `pw-${suffix}` },
  });

  await page.waitForTimeout(2000);

  const orgListResponse = await page.request.get(`${GATEWAY_URL}/api/v1/auth/list-organizations`);
  const orgList = await orgListResponse.json();
  const firstOrg = Array.isArray(orgList) ? orgList[0] : orgList?.organizations?.[0];

  if (firstOrg?.id) {
    await page.request.post(`${GATEWAY_URL}/api/v1/auth/organization/set-active`, {
      data: { organizationId: firstOrg.id },
    });
    await page.waitForTimeout(2000);
  }

  await page.context().storageState({ path: STORAGE_PATH });
});
