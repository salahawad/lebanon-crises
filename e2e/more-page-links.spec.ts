import { test, expect } from '@playwright/test';

const BASE = '/en';

// All pages linked from the More page
const MORE_PAGE_LINKS = [
  { label: 'Capacity Cards', path: '/capacity' },
  { label: 'Resource Tracker', path: '/resources' },
  { label: 'Urgency Alerts', path: '/alerts' },
  { label: 'Timeline', path: '/timeline' },
  { label: 'Flash Assessment', path: '/assessment' },
  { label: 'Collaboration', path: '/collaborate' },
  { label: 'Messaging', path: '/messages' },
  { label: 'Sector Planning', path: '/planning' },
  { label: 'Community Feedback', path: '/feedback' },
  { label: 'Outcomes', path: '/outcomes' },
  { label: 'Verification', path: '/verification' },
  { label: 'Register Organization', path: '/intake' },
  { label: 'API Documentation', path: '/api' },
  { label: 'Privacy & Settings', path: '/settings' },
];

test.describe('More Page — all links navigate correctly', () => {
  test('More page renders all feature links', async ({ page }) => {
    await page.goto(`${BASE}/more`);
    await page.waitForLoadState('networkidle');

    for (const item of MORE_PAGE_LINKS) {
      await expect(
        page.getByRole('link', { name: new RegExp(item.label, 'i') })
      ).toBeVisible();
    }
  });

  for (const item of MORE_PAGE_LINKS) {
    test(`"${item.label}" link points to ${item.path}`, async ({ page }) => {
      await page.goto(`${BASE}/more`);
      await page.waitForLoadState('networkidle');

      // Verify the href is correct
      const link = page.getByRole('link', { name: new RegExp(item.label, 'i') });
      const href = await link.getAttribute('href');
      expect(href).toContain(item.path);

      // Click and wait for navigation
      await Promise.all([
        page.waitForURL(`**${item.path}*`, { timeout: 10000 }),
        link.click(),
      ]);

      // Page loaded successfully
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(50);
    });
  }
});

// Test all platform pages directly by URL to confirm 200
const ALL_PLATFORM_PAGES = [
  '/needs',
  '/actors',
  '/actors/a1',
  '/map',
  '/capacity',
  '/capacity/a1',
  '/alerts',
  '/resources',
  '/timeline',
  '/collaborate',
  '/collaborate/jo1',
  '/messages',
  '/messages/mt1',
  '/assessment',
  '/planning',
  '/verification',
  '/feedback',
  '/outcomes',
  '/intake',
  '/api',
  '/settings',
  '/more',
  '/platform',
];

test.describe('All platform pages load without errors', () => {
  for (const path of ALL_PLATFORM_PAGES) {
    test(`${path} loads with 200`, async ({ page }) => {
      const resp = await page.goto(`${BASE}${path}`);
      expect(resp?.status()).toBe(200);

      // No "not found" text
      const body = await page.locator('body').innerText();
      expect(body.toLowerCase()).not.toContain('this page could not be found');
    });
  }
});
