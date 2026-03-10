import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

// ---------------------------------------------------------------------------
// Service Health Checks
// ---------------------------------------------------------------------------

test.describe('Service Health Checks', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Gateway health', async ({ request }) => {
    const res = await request.get('https://dev.api.crowai.dev/health');
    expect(res.status()).toBe(200);
  });

  test('Auth API health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.auth-api.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('User service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.users.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Org service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.orgs.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Product service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.products.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Billing service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.billing.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Notification service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.notifications.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Interaction service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.interactions.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Pattern service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.patterns.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Analytics service health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.analytics.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('CCTV service health', async ({ request }) => {
    const res = await request.get('https://dev.cctv.crowai.dev/health');
    expect(res.status()).toBe(200);
  });

  test('Chat service health', async ({ request }) => {
    const res = await request.get('https://dev.internal.chat.crowai.dev/');
    expect(res.status()).toBe(200);
  });

  test('QnA service health', async ({ request }) => {
    const res = await request.get('https://dev.internal.qna.crowai.dev/');
    expect(res.status()).toBe(200);
  });

  test('MCP service health', async ({ request }) => {
    const res = await request.get('https://dev.mcp.crowai.dev/');
    expect(res.status()).toBe(200);
  });

  test('Web Ingest health', async ({ request }) => {
    const res = await request.get(
      'https://dev.internal.ingest-worker.crowai.dev/health',
    );
    expect(res.status()).toBe(200);
  });

  test('Dashboard auth login page loads', async ({ request }) => {
    const res = await request.get('https://dev.auth.crowai.dev/login');
    expect(res.status()).toBe(200);
  });

  test('Dashboard app responds (no 5xx)', async ({ request }) => {
    const res = await request.get('https://dev.app.crowai.dev/', {
      maxRedirects: 0,
    });
    expect(res.status()).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// Security Tests
// ---------------------------------------------------------------------------

test.describe('Security Checks', () => {
  test('Internal analytics endpoint rejects unauthenticated requests', async ({
    request,
  }) => {
    const res = await request.get(
      'https://dev.internal.analytics.crowai.dev/api/v1/analytics/events',
    );
    expect(res.status()).toBe(401);
  });

  test('CORS blocks evil origin on gateway', async ({ request }) => {
    const res = await request.get(
      'https://dev.api.crowai.dev/api/v1/auth/get-session',
      {
        headers: {
          Origin: 'https://evil.com',
        },
      },
    );

    const allowOrigin = res.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('https://evil.com');
  });

  test('CCTV ingest requires auth', async ({ request }) => {
    const res = await request.post(
      'https://dev.cctv.crowai.dev/api/v1/cctv/ingest/frame',
    );
    expect([401, 403]).toContain(res.status());
  });
});
