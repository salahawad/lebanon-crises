import { expect, test, type Page } from '@playwright/test';

const PLATFORM_BASE_EN = '/en/platform';
const PLATFORM_BASE_AR = '/ar/platform';

async function signInWithSampleAccount(page: Page, account: 'actor' | 'admin') {
  await page.goto(`${PLATFORM_BASE_EN}/login`);
  await page.getByTestId(`platform-login-sample-${account}`).click();
  await page.getByTestId('platform-login-submit').click();
}

test.describe('Shabaka platform access pages', () => {
  test('signed-out org workspace prompts for Shabaka sign-in', async ({ page }) => {
    await page.goto(`${PLATFORM_BASE_EN}/me`);

    await expect(page.getByTestId('platform-me-heading')).toBeVisible();
    await expect(page.getByTestId('platform-me-sign-in-cta')).toBeVisible();
  });

  test('signed-out review queue prompts for Shabaka sign-in', async ({ page }) => {
    await page.goto(`${PLATFORM_BASE_EN}/review`);

    await expect(page.getByTestId('platform-review-heading')).toBeVisible();
    await expect(page.getByTestId('platform-review-sign-in-cta')).toBeVisible();
  });

  test('actor sample account reaches the org workspace', async ({ page }) => {
    await signInWithSampleAccount(page, 'actor');

    await page.waitForURL(`**${PLATFORM_BASE_EN}/me`);
    await expect(page.getByTestId('platform-me-actor-card')).toBeVisible();
    await expect(page.getByTestId('platform-me-verification')).toBeVisible();
  });

  test('platform admin sample account reaches the review queue', async ({ page }) => {
    await signInWithSampleAccount(page, 'admin');

    await page.waitForURL(`**${PLATFORM_BASE_EN}/review`);
    await expect(page.getByTestId('platform-review-heading')).toBeVisible();
    await expect(page.getByTestId('platform-review-card-is1')).toBeVisible();
  });

  test('actor accounts are blocked from the platform-admin review queue', async ({ page }) => {
    await signInWithSampleAccount(page, 'actor');
    await page.waitForURL(`**${PLATFORM_BASE_EN}/me`);

    await page.goto(`${PLATFORM_BASE_EN}/review`);

    await expect(page.getByTestId('platform-review-access-denied')).toBeVisible();
  });

  test('arabic routes stay rtl while technical contact fields stay ltr', async ({ page }) => {
    await page.goto(`${PLATFORM_BASE_AR}/login`);

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('platform-login-email')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByTestId('platform-login-password')).toHaveAttribute('dir', 'ltr');

    await page.getByTestId('platform-login-sample-actor').click();
    await page.getByTestId('platform-login-submit').click();

    await page.waitForURL(`**${PLATFORM_BASE_AR}/me`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByText('+961 1 300 005')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByText('info@amel.org')).toHaveAttribute('dir', 'ltr');
  });
});
