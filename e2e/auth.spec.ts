import { expect, test } from '@playwright/test';

const AUTH_URL = 'https://dev.auth.crowai.dev';
const DASHBOARD_URL = 'https://dev.app.crowai.dev';

// ---------------------------------------------------------------------------
// 1. Login page UI
// ---------------------------------------------------------------------------
test.describe('Auth - Login Page', () => {
  test('login page loads with email input, password input, and sign-in button', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign.?in/i })).toBeVisible();
  });

  test('login page has a link or button to signup', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    const signupLink = page.locator('a[href*="signup"], a[href*="sign-up"], a[href*="register"], button:has-text("sign up"), button:has-text("Sign Up"), button:has-text("Register"), a:has-text("sign up"), a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create account"), a:has-text("create account")');
    await expect(signupLink.first()).toBeVisible({ timeout: 10_000 });
  });

  test('page title contains CROW or dashboard related text', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await expect(page).toHaveTitle(/crow|dashboard|login|auth/i, { timeout: 10_000 });
  });

  test('no 5xx server errors on login page', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.goto(`${AUTH_URL}/login`, { waitUntil: 'networkidle' });
    expect(serverErrors).toEqual([]);
  });

  test('login page does not leak server errors or stack traces', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`, { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toMatch(/stack\s*trace/i);
    expect(bodyText).not.toMatch(/at\s+\w+\s+\(.*:\d+:\d+\)/); // stack frame pattern
    expect(bodyText).not.toMatch(/Internal Server Error/i);
    expect(bodyText).not.toMatch(/ECONNREFUSED/i);
    expect(bodyText).not.toMatch(/TypeError:/);
    expect(bodyText).not.toMatch(/ReferenceError:/);
    expect(bodyText).not.toMatch(/Cannot read properties of/i);
  });
});

// ---------------------------------------------------------------------------
// 2. Signup page UI
// ---------------------------------------------------------------------------
test.describe('Auth - Signup Page', () => {
  test('signup page loads at /signup with name, email, and password fields', async ({ page }) => {
    // Try common signup paths
    const signupPaths = ['/signup', '/sign-up', '/register'];
    let loaded = false;

    for (const path of signupPaths) {
      const response = await page.goto(`${AUTH_URL}${path}`);
      if (response && response.status() < 400) {
        loaded = true;
        break;
      }
    }

    expect(loaded).toBe(true);

    await expect(page.locator('input[name="name"], input[placeholder*="name" i], input[autocomplete="name"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('no 5xx server errors on signup page', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    const signupPaths = ['/signup', '/sign-up', '/register'];
    for (const path of signupPaths) {
      const response = await page.goto(`${AUTH_URL}${path}`, { waitUntil: 'networkidle' });
      if (response && response.status() < 400) break;
    }

    expect(serverErrors).toEqual([]);
  });

  test('signup page does not leak server errors or stack traces', async ({ page }) => {
    const signupPaths = ['/signup', '/sign-up', '/register'];
    for (const path of signupPaths) {
      const response = await page.goto(`${AUTH_URL}${path}`, { waitUntil: 'networkidle' });
      if (response && response.status() < 400) break;
    }

    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toMatch(/stack\s*trace/i);
    expect(bodyText).not.toMatch(/at\s+\w+\s+\(.*:\d+:\d+\)/);
    expect(bodyText).not.toMatch(/Internal Server Error/i);
    expect(bodyText).not.toMatch(/TypeError:/);
    expect(bodyText).not.toMatch(/ReferenceError:/);
  });
});

// ---------------------------------------------------------------------------
// 3. Invalid credentials / validation
// ---------------------------------------------------------------------------
test.describe('Auth - Credential Validation', () => {
  test('invalid credentials show error message', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await page.locator('input[type="email"], input[name="email"]').fill('nonexistent@testcrow.com');
    await page.locator('input[type="password"]').fill('TotallyWrongPass123');
    await page.getByRole('button', { name: /sign.?in/i }).click();

    // Wait for any error indication (toast, inline message, alert, etc.)
    const errorIndicator = page.locator('text=/invalid|incorrect|wrong|error|failed|not found|doesn.t exist/i')
      .or(page.locator('[role="alert"]'))
      .or(page.locator('.error'))
      .or(page.locator('.toast'))
      .or(page.locator('[data-testid*="error"]'));

    await expect(errorIndicator.first()).toBeVisible({ timeout: 10_000 });
  });

  test('empty email submission is prevented or shows validation error', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    // Leave email empty, fill password
    await page.locator('input[type="password"]').fill('SomePassword123');
    await page.getByRole('button', { name: /sign.?in/i }).click();

    // Either HTML5 validation prevents submission (email input becomes :invalid)
    // or an error message appears
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    const errorVisible = await page.locator('text=/required|email|invalid|enter/i').first().isVisible().catch(() => false);

    expect(isInvalid || errorVisible).toBe(true);
  });

  test('empty password submission is prevented or shows validation error', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await page.locator('input[type="email"], input[name="email"]').fill('test@testcrow.com');
    // Leave password empty
    await page.getByRole('button', { name: /sign.?in/i }).click();

    const passwordInput = page.locator('input[type="password"]');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    const errorVisible = await page.locator('text=/required|password|invalid|enter/i').first().isVisible().catch(() => false);

    expect(isInvalid || errorVisible).toBe(true);
  });

  test('completely empty form submission is prevented or shows validation', async ({ page }) => {
    await page.goto(`${AUTH_URL}/login`);
    await page.getByRole('button', { name: /sign.?in/i }).click();

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    const errorVisible = await page.locator('text=/required|email|invalid|enter|fill/i').first().isVisible().catch(() => false);

    expect(isInvalid || errorVisible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Unauthenticated access — should redirect to auth login
// ---------------------------------------------------------------------------
test.describe('Unauthenticated access - redirects to login', () => {
  // Override storageState to ensure no auth cookies
  test.use({ storageState: { cookies: [], origins: [] } });

  const protectedRoutes = [
    { name: 'dashboard root (/)', path: '/' },
    { name: '/catalog', path: '/catalog' },
    { name: '/analytics', path: '/analytics' },
    { name: '/settings', path: '/settings' },
    { name: '/team', path: '/team' },
    { name: '/billing', path: '/billing' },
    { name: '/integrations', path: '/integrations' },
    { name: '/organization', path: '/organization' },
    { name: '/dashboard/chat', path: '/dashboard/chat' },
    { name: '/dashboard/interactions', path: '/dashboard/interactions' },
    { name: '/dashboard/patterns', path: '/dashboard/patterns' },
    { name: '/dashboard/settings', path: '/dashboard/settings' },
  ];

  for (const route of protectedRoutes) {
    test(`unauthenticated access to ${route.name} redirects to login`, async ({ page }) => {
      await page.goto(`${DASHBOARD_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });

      // Wait for redirect — should end up on auth domain login page
      await page.waitForURL(
        /auth\.crowai\.dev\/(login|signin|sign-in)|\/login|\/signin|\/sign-in/i,
        { timeout: 15_000 },
      );

      // Confirm we are on a login page by checking for email/password inputs
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput).toBeVisible({ timeout: 10_000 });
    });
  }

  test('no 5xx errors during redirect from protected routes', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Visit dashboard root — should redirect
    await page.goto(`${DASHBOARD_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.waitForURL(
      /auth\.crowai\.dev\/(login|signin|sign-in)|\/login|\/signin|\/sign-in/i,
      { timeout: 15_000 },
    ).catch(() => {
      // Even if redirect URL doesn't match, we still check for 5xx
    });

    expect(serverErrors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. Auth pages security — no information leakage
// ---------------------------------------------------------------------------
test.describe('Auth pages - no information leakage', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const authPages = ['/login', '/signup', '/sign-up'];

  for (const path of authPages) {
    test(`${path} does not expose sensitive server info`, async ({ page }) => {
      const response = await page.goto(`${AUTH_URL}${path}`, { waitUntil: 'networkidle', timeout: 15_000 });
      if (!response || response.status() >= 400) {
        // Page doesn't exist (e.g. /sign-up vs /signup), skip
        test.skip();
        return;
      }

      const bodyText = await page.locator('body').textContent() ?? '';

      // Should not contain stack traces
      expect(bodyText).not.toMatch(/at\s+\w+\s+\(.*:\d+:\d+\)/);
      // Should not contain server technology details
      expect(bodyText).not.toMatch(/node_modules/i);
      expect(bodyText).not.toMatch(/webpack-internal/i);
      // Should not contain environment variables or secrets
      expect(bodyText).not.toMatch(/process\.env/);
      expect(bodyText).not.toMatch(/BETTER_AUTH_SECRET/i);
      expect(bodyText).not.toMatch(/INTERNAL_GATEWAY_KEY/i);

      // Response headers should not expose server version
      const serverHeader = response.headers().server ?? '';
      expect(serverHeader).not.toMatch(/\d+\.\d+\.\d+/); // no version numbers
    });
  }
});
