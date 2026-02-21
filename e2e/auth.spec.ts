import { expect, test } from '@playwright/test';

const AUTH_URL = 'https://dev.auth.crowai.dev';

test.describe('Auth - Login Page', () => {
  test('login page loads and displays form', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await page.locator('input[type="email"], input[name="email"]').fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for error toast or message
    await expect(page.locator('text=/invalid|incorrect|wrong|error/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('page title contains CROW', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await expect(page).toHaveTitle(/crow/i);
  });
});
