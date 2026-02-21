import { expect, test } from '@playwright/test';

test.describe('Dashboard - Unauthenticated', () => {
  test('redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/');
    // Should redirect to auth login
    await expect(page).toHaveURL(/auth\.crowai\.dev|\/login/, { timeout: 10000 });
  });

  test('dashboard domain responds', async ({ page }) => {
    const response = await page.goto('https://dev.app.crowai.dev/');
    expect(response?.status()).toBeLessThan(500);
  });
});
