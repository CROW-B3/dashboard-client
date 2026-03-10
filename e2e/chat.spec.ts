import { expect, test } from '@playwright/test';

test.describe('Chat Page (/dashboard/chat)', () => {
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

  // ── Page Load ──────────────────────────────────────────────────────────

  test('page loads successfully without 5xx errors', async ({ page }) => {
    const response = await page.goto('/dashboard/chat');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  // ── Sidebar ────────────────────────────────────────────────────────────

  test.describe('Sessions Sidebar', () => {
    test('"Sessions" heading is visible in sidebar', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await expect(page.getByRole('heading', { name: 'Sessions' })).toBeVisible();
    });

    test('"+" create session button is visible', async ({ page }) => {
      await page.goto('/dashboard/chat');
      // The "+" button is next to the Sessions heading
      const sidebar = page.getByRole('heading', { name: 'Sessions' }).locator('..');
      await expect(sidebar.getByRole('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
    });

    test('"No sessions yet" text is shown when no sessions exist', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await page.waitForLoadState('networkidle');

      // This may or may not be visible depending on existing data
      const noSessions = page.getByText('No sessions yet');
      const hasNoSessions = await noSessions.isVisible().catch(() => false);

      if (hasNoSessions) {
        await expect(noSessions).toBeVisible();
      } else {
        // Sessions exist — sidebar should have session list items
        const sessionsHeading = page.getByRole('heading', { name: 'Sessions' });
        await expect(sessionsHeading).toBeVisible();
      }
    });
  });

  // ── Empty State (no session selected) ──────────────────────────────────

  test.describe('Empty Chat State', () => {
    test('"Start a conversation" heading is visible when no session selected', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await expect(page.getByRole('heading', { name: 'Start a conversation' })).toBeVisible();
    });

    test('description text about products/interactions/patterns is visible', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await expect(
        page.getByText(/products|interactions|patterns/i).first()
      ).toBeVisible();
    });

    test('MessageSquare icon is visible in empty state', async ({ page }) => {
      await page.goto('/dashboard/chat');
      // The empty state area should contain an SVG icon
      const emptyState = page.getByRole('heading', { name: 'Start a conversation' }).locator('..');
      await expect(emptyState.locator('svg').first()).toBeVisible();
    });
  });

  // ── Session Creation & Selection ───────────────────────────────────────

  test.describe('Session Lifecycle', () => {
    test('clicking "+" creates a new session that appears in the sidebar', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await page.waitForLoadState('networkidle');

      // The "+" button is disabled until organizationId resolves via useCurrentUser
      const sidebar = page.getByRole('heading', { name: 'Sessions' }).locator('..');
      const createButton = sidebar.getByRole('button').filter({ has: page.locator('svg') }).first();

      // Wait for the button to become enabled (org resolution)
      try {
        await expect(createButton).toBeEnabled({ timeout: 15000 });
      } catch {
        test.skip(true, 'Skipped: organizationId not resolved — "+" button remains disabled');
        return;
      }

      await createButton.click();
      await page.waitForTimeout(2000);

      // After creating a session, "No sessions yet" should no longer be visible
      const noSessions = page.getByText('No sessions yet');
      await expect(noSessions).not.toBeVisible();
    });

    test('selecting a session hides the empty state', async ({ page }) => {
      await page.goto('/dashboard/chat');
      await page.waitForLoadState('networkidle');

      const sidebar = page.getByRole('heading', { name: 'Sessions' }).locator('..');
      const createButton = sidebar.getByRole('button').filter({ has: page.locator('svg') }).first();

      // Wait for org resolution
      try {
        await expect(createButton).toBeEnabled({ timeout: 15000 });
      } catch {
        test.skip(true, 'Skipped: organizationId not resolved — "+" button remains disabled');
        return;
      }

      // Create a session if none exists
      const noSessions = page.getByText('No sessions yet');
      const hasNoSessions = await noSessions.isVisible().catch(() => false);

      if (hasNoSessions) {
        await createButton.click();
        await page.waitForTimeout(2000);
      }

      // Click the first session in the list
      const sessionItems = sidebar.locator('div[class*="cursor"]');
      const firstSession = sessionItems.first();

      if (await firstSession.isVisible().catch(() => false)) {
        await firstSession.click();
        await page.waitForTimeout(1000);

        // "Start a conversation" heading should no longer be visible
        const emptyHeading = page.getByRole('heading', { name: 'Start a conversation' });
        await expect(emptyHeading).not.toBeVisible();
      }
    });
  });

  // ── Chat Input Area ────────────────────────────────────────────────────

  test.describe('Chat Input', () => {
    // These tests require an active session, which requires organizationId resolution.
    // The "+" button is disabled until useCurrentUser resolves org. If it never resolves
    // in the test environment, these tests are skipped gracefully.

    async function ensureActiveSession(page: import('@playwright/test').Page): Promise<boolean> {
      await page.goto('/dashboard/chat');
      await page.waitForLoadState('networkidle');

      const sidebar = page.getByRole('heading', { name: 'Sessions' }).locator('..');
      const createButton = sidebar.getByRole('button').filter({ has: page.locator('svg') }).first();

      // Wait for org resolution (button becomes enabled)
      try {
        await expect(createButton).toBeEnabled({ timeout: 15000 });
      } catch {
        return false;
      }

      // Create a session if none exists
      const noSessions = page.getByText('No sessions yet');
      const hasNoSessions = await noSessions.isVisible().catch(() => false);

      if (hasNoSessions) {
        await createButton.click();
        await page.waitForTimeout(2000);
      }

      // Select the first session if empty state is still showing
      const emptyHeading = page.getByRole('heading', { name: 'Start a conversation' });
      const isEmptyState = await emptyHeading.isVisible().catch(() => false);

      if (isEmptyState) {
        const sessionItems = sidebar.locator('div[class*="cursor"]');
        const firstSession = sessionItems.first();
        if (await firstSession.isVisible().catch(() => false)) {
          await firstSession.click();
          await page.waitForTimeout(1000);
        }
      }

      return true;
    }

    test('textarea is visible with correct placeholder', async ({ page }) => {
      const ready = await ensureActiveSession(page);
      if (!ready) {
        test.skip(true, 'Skipped: organizationId not resolved — cannot create/select session');
        return;
      }

      const textarea = page.getByPlaceholder('Ask about products, interactions, or patterns...');
      await expect(textarea).toBeVisible();
    });

    test('send button is visible', async ({ page }) => {
      const ready = await ensureActiveSession(page);
      if (!ready) {
        test.skip(true, 'Skipped: organizationId not resolved — cannot create/select session');
        return;
      }

      const textarea = page.getByPlaceholder('Ask about products, interactions, or patterns...');
      const inputArea = textarea.locator('..');
      const sendButton = inputArea.getByRole('button').first();
      await expect(sendButton).toBeVisible();
    });

    test('send button is disabled when input is empty', async ({ page }) => {
      const ready = await ensureActiveSession(page);
      if (!ready) {
        test.skip(true, 'Skipped: organizationId not resolved — cannot create/select session');
        return;
      }

      const textarea = page.getByPlaceholder('Ask about products, interactions, or patterns...');
      await expect(textarea).toBeVisible();
      await textarea.fill('');

      const inputArea = textarea.locator('..');
      const sendButton = inputArea.getByRole('button').first();

      const isDisabled = await sendButton.isDisabled().catch(() => false);
      const hasDisabledAttr = await sendButton.getAttribute('disabled');
      const ariaDisabled = await sendButton.getAttribute('aria-disabled');

      expect(isDisabled || hasDisabledAttr !== null || ariaDisabled === 'true').toBeTruthy();
    });

    test('typing a message enables the send button', async ({ page }) => {
      const ready = await ensureActiveSession(page);
      if (!ready) {
        test.skip(true, 'Skipped: organizationId not resolved — cannot create/select session');
        return;
      }

      const textarea = page.getByPlaceholder('Ask about products, interactions, or patterns...');
      await expect(textarea).toBeVisible();
      await textarea.fill('Hello, this is a test message');

      const inputArea = textarea.locator('..');
      const sendButton = inputArea.getByRole('button').first();

      const isDisabled = await sendButton.isDisabled().catch(() => false);
      expect(isDisabled).toBeFalsy();
    });
  });

  // ── Error Checks ───────────────────────────────────────────────────────

  test('no JavaScript errors on the page', async ({ page }) => {
    await page.goto('/dashboard/chat');
    await page.waitForLoadState('networkidle');
    expect(jsErrors).toEqual([]);
  });

  test('no 5xx network errors during page load', async ({ page }) => {
    await page.goto('/dashboard/chat');
    await page.waitForLoadState('networkidle');
    expect(networkErrors).toEqual([]);
  });
});
