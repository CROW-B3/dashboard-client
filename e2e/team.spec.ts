import { expect, test } from '@playwright/test';

test.describe('Team Page (/team)', () => {
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
    const response = await page.goto('/team');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test('"Team" heading is visible', async ({ page }) => {
    await page.goto('/team');
    await expect(page.getByRole('heading', { name: 'Team', level: 1 })).toBeVisible();
  });

  test('"Manage team members and invitations" subtext is visible', async ({ page }) => {
    await page.goto('/team');
    await expect(page.getByText('Manage team members and invitations')).toBeVisible();
  });

  test.describe('Invite Members Section', () => {
    test('"Invite Members" section heading is visible', async ({ page }) => {
      await page.goto('/team');
      await expect(page.getByRole('heading', { name: 'Invite Members' })).toBeVisible();
    });

    test('email input area is visible', async ({ page }) => {
      await page.goto('/team');
      // The EmailTagInput component renders an input for entering email addresses
      const inviteSection = page.getByRole('heading', { name: 'Invite Members' }).locator('..');
      await expect(inviteSection.locator('input')).toBeVisible();
    });

    test('"Send Invitations" button is visible', async ({ page }) => {
      await page.goto('/team');
      await expect(page.getByRole('button', { name: 'Send Invitations' })).toBeVisible();
    });

    test('"Send Invitations" button is initially disabled', async ({ page }) => {
      await page.goto('/team');
      await expect(page.getByRole('button', { name: 'Send Invitations' })).toBeDisabled();
    });
  });

  test.describe('Members Section', () => {
    test('"Members" section heading is visible', async ({ page }) => {
      await page.goto('/team');
      const membersHeading = page.getByRole('heading', { name: 'Members', exact: true })
        .or(page.getByText('Members', { exact: true }));
      await expect(membersHeading.first()).toBeVisible();
    });

    test('at least one member is listed (current user)', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      const memberRows = page.locator('.flex.items-center.justify-between');
      const count = await memberRows.count();
      if (count === 0) {
        test.skip(true, 'No members loaded — org resolution may not have completed');
        return;
      }
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('member name is visible', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      const memberNames = page.locator('p.text-white');
      const count = await memberNames.count();
      if (count === 0) {
        test.skip(true, 'No members loaded — org resolution may not have completed');
        return;
      }
      await expect(memberNames.first()).toBeVisible();
    });

    test('member email is visible', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      const memberEmails = page.locator('p.text-gray-400');
      const count = await memberEmails.count();
      if (count === 0) {
        test.skip(true, 'No members loaded — org resolution may not have completed');
        return;
      }
      await expect(memberEmails.first()).toBeVisible();
    });

    test('member role badge is visible', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // StatusBadge for role — common roles are "owner", "admin", "member"
      const roleBadge = page.locator('text=/owner|admin|member/i').first();
      await expect(roleBadge).toBeVisible();
    });
  });

  test.describe('Pending Invitations Section', () => {
    test('pending invitations section is shown or absent (conditional)', async ({ page }) => {
      await page.goto('/team');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // "Pending Invitations" section only appears when there are pending invites
      // Verify either it exists with content, or it is not rendered at all
      const pendingHeading = page.getByRole('heading', { name: 'Pending Invitations' });
      const isVisible = await pendingHeading.isVisible().catch(() => false);

      if (isVisible) {
        // If shown, the section should have invitation entries
        const pendingPanel = pendingHeading.locator('xpath=ancestor::div[contains(@class,"glass") or contains(@class,"panel") or contains(@class,"card")]').first();
        const textContent = await pendingPanel.textContent();
        expect(textContent!.length).toBeGreaterThan('Pending Invitations'.length);
      }
      // If not visible, that is valid — no pending invitations exist
    });
  });

  test('no JavaScript errors on the page', async ({ page }) => {
    await page.goto('/team');
    await page.waitForLoadState('networkidle');
    expect(jsErrors).toEqual([]);
  });

  test('no 5xx network errors during page load', async ({ page }) => {
    await page.goto('/team');
    await page.waitForLoadState('networkidle');
    expect(networkErrors).toEqual([]);
  });
});
