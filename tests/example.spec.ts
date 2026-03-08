import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

test.describe('Dashboard - Unauthenticated access', () => {
  test('root path redirects to auth login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL  }/`);
    // Middleware calls the gateway session endpoint; without a valid session cookie
    // it redirects to the external auth service login page.
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('dashboard sub-path redirects to auth login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL  }/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('page title contains CROW or Dashboard after redirect', async ({ page }) => {
    await page.goto(`${BASE_URL  }/`);
    // The auth-client login page carries the CROW branding.
    await expect(page).toHaveTitle(/crow|dashboard|sign.?in|log.?in/i, { timeout: 10000 });
  });

  test('dashboard domain responds without a server error', async ({ page }) => {
    const response = await page.goto(`${BASE_URL  }/`);
    // Any redirect (3xx) or successful auth page (2xx) is acceptable;
    // a 5xx would indicate a broken deployment.
    expect(response?.status()).toBeLessThan(500);
  });
});
