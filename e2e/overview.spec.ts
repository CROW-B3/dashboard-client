import { expect, test } from '@playwright/test';

test.describe('Overview Page (/)', () => {
  const jsErrors: string[] = [];
  const networkErrors: { url: string; status: number }[] = [];

  test.beforeEach(async ({ page }) => {
    jsErrors.length = 0;
    networkErrors.length = 0;

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    page.on('response', (response) => {
      if (response.status() >= 500) {
        networkErrors.push({ url: response.url(), status: response.status() });
      }
    });
  });

  test('page loads successfully without 5xx errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test('"Overview" heading is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('"Your organization at a glance" subtext is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Your organization at a glance')).toBeVisible();
  });

  test.describe('Metrics Cards', () => {
    test('"Total Interactions" card is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Total Interactions').first()).toBeVisible();
    });

    test('"Total Patterns" card is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Total Patterns')).toBeVisible();
    });

    test('"Web Interactions" card is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Web Interactions')).toBeVisible();
    });

    test('"CCTV Interactions" card is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('CCTV Interactions')).toBeVisible();
    });

    test('all 4 metrics cards are present on the page', async ({ page }) => {
      await page.goto('/');
      const expectedCards = [
        'Total Interactions',
        'Total Patterns',
        'Web Interactions',
        'CCTV Interactions',
      ];
      for (const title of expectedCards) {
        await expect(page.getByText(title).first()).toBeVisible();
      }
    });

    test('metrics cards show loading state then resolve to values', async ({ page }) => {
      await page.goto('/');
      // Cards may briefly show "..." as loading indicator before real values load
      // Wait for at least one card to finish loading (no longer showing "...")
      // by checking that a numeric value or "0" appears near a card title
      const totalInteractions = page.getByText('Total Interactions').first();
      await expect(totalInteractions).toBeVisible();

      // Wait for loading to complete — the value should be a number (including 0)
      // The metrics value is typically a sibling or nearby element
      // Give it time to load from the API
      await page.waitForTimeout(3000);

      // After loading, the page should not have all cards still showing "..."
      const loadingIndicators = page.locator('text="..."');
      const loadingCount = await loadingIndicators.count();
      // Allow some cards to still be loading, but not all 4
      expect(loadingCount).toBeLessThan(4);
    });
  });

  test.describe('Top Patterns Section', () => {
    test('"Top Patterns" heading is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Top Patterns' })).toBeVisible();
    });

    test('shows pattern items or empty state', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Top Patterns' })).toBeVisible();

      // Wait for content to load
      await page.waitForTimeout(3000);

      const emptyState = page.getByText('No patterns detected yet');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        await expect(emptyState).toBeVisible();
      } else {
        // If not empty, the section should have some list content
        const topPatternsSection = page.getByRole('heading', { name: 'Top Patterns' }).locator('..');
        // Section should have child elements beyond just the heading
        await expect(topPatternsSection).not.toBeEmpty();
      }
    });
  });

  test.describe('Latest Interactions Section', () => {
    test('"Latest Interactions" heading is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Latest Interactions' })).toBeVisible();
    });

    test('shows interaction items or empty state', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Latest Interactions' })).toBeVisible();

      // Wait for content to load
      await page.waitForTimeout(3000);

      const emptyState = page.getByText('No interactions yet');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        await expect(emptyState).toBeVisible();
      } else {
        const interactionsSection = page.getByRole('heading', { name: 'Latest Interactions' }).locator('..');
        await expect(interactionsSection).not.toBeEmpty();
      }
    });
  });

  test('no JavaScript errors on the page', async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully render and API calls to complete
    await page.waitForLoadState('networkidle');
    expect(jsErrors).toEqual([]);
  });

  test('no 5xx network errors during page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(networkErrors).toEqual([]);
  });
});

test.describe('Dashboard Page (/dashboard)', () => {
  const jsErrors: string[] = [];
  const networkErrors: { url: string; status: number }[] = [];

  test.beforeEach(async ({ page }) => {
    jsErrors.length = 0;
    networkErrors.length = 0;

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    page.on('response', (response) => {
      if (response.status() >= 500) {
        networkErrors.push({ url: response.url(), status: response.status() });
      }
    });
  });

  test('page loads successfully without 5xx errors', async ({ page }) => {
    const response = await page.goto('/dashboard');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test('"Analytics" heading is visible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Analytics', level: 1 })).toBeVisible();
  });

  test('welcome message is visible', async ({ page }) => {
    await page.goto('/dashboard');
    // Welcome message contains user name or email
    await expect(page.getByText(/welcome/i).first()).toBeVisible();
  });

  test.describe('Metrics Cards', () => {
    test('"Total Interactions" card is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('Total Interactions').first()).toBeVisible();
    });

    test('"Active Patterns" card is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('Active Patterns')).toBeVisible();
    });

    test('"Web Sources" card is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('Web Sources')).toBeVisible();
    });

    test('"CCTV Sources" card is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('CCTV Sources')).toBeVisible();
    });

    test('all 4 dashboard metrics cards are present', async ({ page }) => {
      await page.goto('/dashboard');
      const expectedCards = [
        'Total Interactions',
        'Active Patterns',
        'Web Sources',
        'CCTV Sources',
      ];
      for (const title of expectedCards) {
        await expect(page.getByText(title).first()).toBeVisible();
      }
    });

    test('metrics cards show loading state then resolve to values', async ({ page }) => {
      await page.goto('/dashboard');
      const totalInteractions = page.getByText('Total Interactions').first();
      await expect(totalInteractions).toBeVisible();

      await page.waitForTimeout(3000);

      const loadingIndicators = page.locator('text="..."');
      const loadingCount = await loadingIndicators.count();
      expect(loadingCount).toBeLessThan(4);
    });
  });

  test.describe('Recent Interactions Section', () => {
    test('"Recent Interactions" heading is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Recent Interactions' })).toBeVisible();
    });

    test('shows interaction items or empty state', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Recent Interactions' })).toBeVisible();

      await page.waitForTimeout(3000);

      const emptyState = page.getByText('No interactions yet');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        await expect(emptyState).toBeVisible();
      } else {
        const section = page.getByRole('heading', { name: 'Recent Interactions' }).locator('..');
        await expect(section).not.toBeEmpty();
      }
    });
  });

  test.describe('Recent Patterns Section', () => {
    test('"Recent Patterns" heading is visible', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Recent Patterns' })).toBeVisible();
    });

    test('shows pattern items or empty state', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Recent Patterns' })).toBeVisible();

      await page.waitForTimeout(3000);

      const emptyState = page.getByText('No patterns detected yet');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        await expect(emptyState).toBeVisible();
      } else {
        const section = page.getByRole('heading', { name: 'Recent Patterns' }).locator('..');
        await expect(section).not.toBeEmpty();
      }
    });
  });

  test('no JavaScript errors on the page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    expect(jsErrors).toEqual([]);
  });

  test('no 5xx network errors during page load', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    expect(networkErrors).toEqual([]);
  });
});
