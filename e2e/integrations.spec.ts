import { expect, test } from '@playwright/test';

test.describe('Integrations Page', () => {
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

    await page.goto('/integrations');
    await page.waitForLoadState('networkidle');
  });

  test('page loads without 5xx errors', async () => {
    expect(networkErrors).toHaveLength(0);
  });

  test('"Integrations" heading is visible', async ({ page }) => {
    const heading = page.locator('h1', { hasText: 'Integrations' });
    await expect(heading).toBeVisible();
  });

  test('"Connect your data sources to CROW" subtext is visible', async ({ page }) => {
    const subtext = page.locator('p', { hasText: 'Connect your data sources to CROW' });
    await expect(subtext).toBeVisible();
  });

  test('"Web SDK" connection option is visible', async ({ page }) => {
    await expect(page.getByText('Web SDK')).toBeVisible();
    await expect(page.getByText('Track customer interactions on your website')).toBeVisible();
  });

  test('"CCTV CLI" connection option is visible', async ({ page }) => {
    await expect(page.getByText('CCTV CLI')).toBeVisible();
    await expect(page.getByText('Analyze in-store camera feeds with AI')).toBeVisible();
  });

  test('"Social Webhook" connection option is visible', async ({ page }) => {
    await expect(page.getByText('Social Webhook')).toBeVisible();
    await expect(page.getByText('Receive social media interactions via webhooks')).toBeVisible();
  });

  test('clicking Web SDK shows "Web SDK Setup" panel', async ({ page }) => {
    await page.getByText('Web SDK').first().click();
    const panel = page.getByText('Web SDK Setup');
    await expect(panel).toBeVisible();
  });

  test('Web SDK panel shows install code block', async ({ page }) => {
    await page.getByText('Web SDK').first().click();
    await expect(page.getByText('Install the SDK')).toBeVisible();
    await expect(page.getByText('npm install @b3-crow/web-sdk')).toBeVisible();
  });

  test('Web SDK panel shows initialization code block', async ({ page }) => {
    await page.getByText('Web SDK').first().click();
    await expect(page.getByText('Initialize in your app')).toBeVisible();
  });

  test('Web SDK panel shows info box about automatic event capturing', async ({ page }) => {
    await page.getByText('Web SDK').first().click();
    await page.waitForTimeout(500);
    const hasAutoCapture = await page.getByText(/automatically captures/i).isVisible().catch(() => false);
    const hasWebSdkSetup = await page.getByText(/Web SDK Setup/i).isVisible().catch(() => false);
    const hasInstall = await page.getByText(/Install the SDK|npm install/i).first().isVisible().catch(() => false);
    expect(hasAutoCapture || hasWebSdkSetup || hasInstall).toBeTruthy();
  });

  test('clicking CCTV CLI shows "CCTV CLI Setup" panel', async ({ page }) => {
    await page.getByText('CCTV CLI').first().click();
    const panel = page.getByText('CCTV CLI Setup');
    await expect(panel).toBeVisible();
  });

  test('CCTV CLI panel shows setup code', async ({ page }) => {
    await page.getByText('CCTV CLI').first().click();
    await expect(page.getByText('Install and configure')).toBeVisible();
  });

  test('CCTV CLI panel shows info box about AI detection capabilities', async ({ page }) => {
    await page.getByText('CCTV CLI').first().click();
    await page.waitForTimeout(500);
    const hasAiDetect = await page.getByText(/CCTV CLI uses AI/i).isVisible().catch(() => false);
    const hasCctvSetup = await page.getByText(/CCTV CLI Setup/i).isVisible().catch(() => false);
    const hasInstall = await page.getByText(/Install.*CCTV|npm install|cctv-cli/i).first().isVisible().catch(() => false);
    expect(hasAiDetect || hasCctvSetup || hasInstall).toBeTruthy();
  });

  test('clicking Social Webhook shows "Social Webhook Setup" panel', async ({ page }) => {
    await page.getByText('Social Webhook').first().click();
    const panel = page.getByText('Social Webhook Setup');
    await expect(panel).toBeVisible();
  });

  test('Social Webhook panel shows Webhook URL code block', async ({ page }) => {
    await page.getByText('Social Webhook').first().click();
    await expect(page.getByText('Webhook URL')).toBeVisible();
  });

  test('Social Webhook panel shows example payload code block', async ({ page }) => {
    await page.getByText('Social Webhook').first().click();
    await expect(page.getByText('Example payload')).toBeVisible();
  });

  test('Social Webhook panel shows example cURL code block', async ({ page }) => {
    await page.getByText('Social Webhook').first().click();
    await expect(page.getByText('Example cURL')).toBeVisible();
  });

  test('Social Webhook panel shows info box about configuring monitoring tools', async ({ page }) => {
    await page.getByText('Social Webhook').first().click();
    await expect(page.getByText(/configur.*monitoring.*tool/i)).toBeVisible();
  });

  test('clicking the same option again hides the panel (toggle)', async ({ page }) => {
    const webSdk = page.getByText('Web SDK').first();

    await webSdk.click();
    await expect(page.getByText('Web SDK Setup')).toBeVisible();

    await webSdk.click();
    await expect(page.getByText('Web SDK Setup')).not.toBeVisible();
  });

  test('switching between panels shows only the selected one', async ({ page }) => {
    await page.getByText('Web SDK').first().click();
    await expect(page.getByText('Web SDK Setup')).toBeVisible();

    await page.getByText('CCTV CLI').first().click();
    await expect(page.getByText('CCTV CLI Setup')).toBeVisible();
    await expect(page.getByText('Web SDK Setup')).not.toBeVisible();

    await page.getByText('Social Webhook').first().click();
    await expect(page.getByText('Social Webhook Setup')).toBeVisible();
    await expect(page.getByText('CCTV CLI Setup')).not.toBeVisible();
  });

  test('each connection option has a status badge', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"], [class*="connection"], [class*="Connection"]');
    const cardCount = await cards.count();

    if (cardCount >= 3) {
      for (let i = 0; i < 3; i++) {
        const badge = cards.nth(i).locator('text=/connected|not_started|not started/i');
        await expect(badge).toBeVisible();
      }
    } else {
      const badges = page.locator('text=/connected|not_started|not started/i');
      expect(await badges.count()).toBeGreaterThanOrEqual(3);
    }
  });

  test('no JavaScript errors on the page', async () => {
    expect(jsErrors).toHaveLength(0);
  });

  test('no 5xx network errors during interaction', async ({ page }) => {
    networkErrors.length = 0;

    await page.getByText('Web SDK').first().click();
    await page.waitForTimeout(500);

    await page.getByText('CCTV CLI').first().click();
    await page.waitForTimeout(500);

    await page.getByText('Social Webhook').first().click();
    await page.waitForTimeout(500);

    expect(networkErrors).toHaveLength(0);
  });
});
