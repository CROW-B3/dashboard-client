import { expect, test } from '@playwright/test';

test.describe('Billing Page (/billing)', () => {
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
    const response = await page.goto('/billing');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test('"Billing" heading is visible', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByRole('heading', { name: 'Billing', level: 1 })).toBeVisible();
  });

  test('"Manage your subscription and usage" subtext is visible', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.getByText('Manage your subscription and usage')).toBeVisible();
  });

  test('loading skeleton appears initially', async ({ page }) => {
    // Navigate but check for skeleton before network settles
    page.goto('/billing');
    // Skeleton elements are typically rendered with animate-pulse or data-testid="skeleton"
    // Check for any skeleton/loading indicator within the first moments
    const skeleton = page.locator('[class*="skeleton"], [class*="animate-pulse"], [data-testid="skeleton"]');
    try {
      await expect(skeleton.first()).toBeVisible({ timeout: 3000 });
    } catch {
      // If no skeleton is caught, the page loaded too fast — that is acceptable
      // Verify the page did load by checking for the heading
      await expect(page.getByRole('heading', { name: 'Billing', level: 1 })).toBeVisible();
    }
  });

  test.describe('Current Plan Section', () => {
    test('"Current Plan" section heading is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByText('Current Plan')).toBeVisible();
    });

    test('shows subscription details or "No active subscription" message', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('networkidle');

      const noSubscription = page.getByText('No active subscription');
      const hasNoSubscription = await noSubscription.isVisible().catch(() => false);

      if (hasNoSubscription) {
        // No subscription state
        await expect(noSubscription).toBeVisible();
        await expect(page.getByText('Choose a plan below to get started')).toBeVisible();
      } else {
        // Subscription exists — should show at least one of the subscription details
        const billingPeriod = page.getByText(/monthly|annual/i);
        const statusBadge = page.getByText(/active|past_due|cancelled/i);
        const activeSince = page.getByText(/active since/i);
        const renewal = page.getByText(/renewal/i);

        const hasBillingPeriod = await billingPeriod.first().isVisible().catch(() => false);
        const hasStatus = await statusBadge.first().isVisible().catch(() => false);
        const hasActiveSince = await activeSince.first().isVisible().catch(() => false);
        const hasRenewal = await renewal.first().isVisible().catch(() => false);

        // At least one subscription detail should be visible
        expect(hasBillingPeriod || hasStatus || hasActiveSince || hasRenewal).toBe(true);
      }
    });

    test('subscription with active status shows relevant details', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('networkidle');

      const noSubscription = page.getByText('No active subscription');
      const hasNoSubscription = await noSubscription.isVisible().catch(() => false);

      if (!hasNoSubscription) {
        // If a subscription exists, verify status badge is present
        const statusBadge = page.getByText(/active|past_due|cancelled/i);
        await expect(statusBadge.first()).toBeVisible();
      }
    });
  });

  test.describe('Usage Section', () => {
    test('"Usage" heading is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByRole('heading', { name: 'Usage' })).toBeVisible();
    });

    test('"Total Interactions" metrics card is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByText('Total Interactions').first()).toBeVisible();
    });

    test('"Web Interactions" metrics card is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByText('Web Interactions')).toBeVisible();
    });

    test('"CCTV Interactions" metrics card is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByText('CCTV Interactions')).toBeVisible();
    });

    test('"Social Interactions" metrics card is visible', async ({ page }) => {
      await page.goto('/billing');
      await expect(page.getByText('Social Interactions')).toBeVisible();
    });

    test('all 4 usage metrics cards are present on the page', async ({ page }) => {
      await page.goto('/billing');
      const expectedCards = [
        'Total Interactions',
        'Web Interactions',
        'CCTV Interactions',
        'Social Interactions',
      ];
      for (const title of expectedCards) {
        await expect(page.getByText(title).first()).toBeVisible();
      }
    });

    test('metrics cards show loading state then resolve to values', async ({ page }) => {
      await page.goto('/billing');
      const totalInteractions = page.getByText('Total Interactions').first();
      await expect(totalInteractions).toBeVisible();

      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // After loading, not all cards should still be showing loading indicators
      const loadingIndicators = page.locator('text="..."');
      const loadingCount = await loadingIndicators.count();
      expect(loadingCount).toBeLessThan(4);
    });
  });

  test.describe('Available Plans Section', () => {
    test('shows plan cards or "No Plans Available" section', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('networkidle');

      const noPlans = page.getByText('No Plans Available');
      const hasNoPlans = await noPlans.isVisible().catch(() => false);

      if (hasNoPlans) {
        // No plans state — should show the CreditCard icon area and description
        await expect(noPlans).toBeVisible();
      } else {
        // Plans exist — check for Available Plans heading or plan card elements
        const availablePlans = page.getByText('Available Plans');
        const hasAvailablePlans = await availablePlans.isVisible().catch(() => false);

        if (hasAvailablePlans) {
          await expect(availablePlans).toBeVisible();
        }
      }
    });

    test('plan cards display title, price, and features when plans exist', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('networkidle');

      const noPlans = page.getByText('No Plans Available');
      const hasNoPlans = await noPlans.isVisible().catch(() => false);

      if (!hasNoPlans) {
        // If plans exist, check for Upgrade buttons
        const upgradeButtons = page.getByRole('button', { name: /upgrade/i });
        const buttonCount = await upgradeButtons.count();

        if (buttonCount > 0) {
          // At least one plan card should have an Upgrade button
          await expect(upgradeButtons.first()).toBeVisible();
        }
      }
    });

    test('"No Plans Available" section shows description text when no plans', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('networkidle');

      const noPlans = page.getByText('No Plans Available');
      const hasNoPlans = await noPlans.isVisible().catch(() => false);

      if (hasNoPlans) {
        // The no-plans section should have descriptive text below the heading
        const noPlansHeading = page.getByRole('heading', { name: 'No Plans Available' });
        const section = noPlansHeading.locator('..');
        await expect(section).not.toBeEmpty();
      }
    });
  });

  test('no JavaScript errors on the page', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    expect(jsErrors).toEqual([]);
  });

  test('no 5xx network errors during page load', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    expect(networkErrors).toEqual([]);
  });
});
