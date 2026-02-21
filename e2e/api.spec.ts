import { expect, test } from '@playwright/test';

test.describe('API Services - Health Checks', () => {
  test('API gateway health', async ({ request }) => {
    const res = await request.get('https://dev.api.crowai.dev/');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('interaction service health', async ({ request }) => {
    const res = await request.get('https://dev.interactions.crowai.dev/');
    expect(res.ok()).toBeTruthy();
  });

  test('pattern service health', async ({ request }) => {
    const res = await request.get('https://dev.patterns.crowai.dev/');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('interaction summary returns valid structure', async ({ request }) => {
    const res = await request.get('https://dev.interactions.crowai.dev/api/v1/interactions/organization/test-org/summary');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('web');
    expect(body).toHaveProperty('cctv');
    expect(body).toHaveProperty('social');
    expect(body).toHaveProperty('total');
  });

  test('pattern service returns org patterns', async ({ request }) => {
    const res = await request.get('https://dev.patterns.crowai.dev/api/v1/patterns/organization/test-org?period=weekly');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('patterns');
    expect(Array.isArray(body.patterns)).toBeTruthy();
  });
});
