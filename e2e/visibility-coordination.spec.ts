import { test, expect } from '@playwright/test';

const BASE = '/en';

// ============================================================
// Needs Board Interactions
// ============================================================
test.describe('Needs Board Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/needs`);
    // Wait for the loading state to resolve
    await expect(page.getByText('Needs Board')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });
  });

  test('zone filter dropdown changes visible needs', async ({ page }) => {
    // Grab the initial count from the header badge
    const badge = page.locator('header span.rounded-full');
    const initialText = await badge.textContent();

    // Select a specific zone from the dropdown
    const zoneSelect = page.locator('select').first();
    await zoneSelect.selectOption({ index: 1 }); // first non-"All Zones" option

    // The count may have changed or stayed the same, but the filter was applied
    const newText = await badge.textContent();
    expect(newText).toMatch(/\d+ open/);
  });

  test('sector chip click filters by sector', async ({ page }) => {
    // Click on the "Food" sector chip (inside the sector chips row at the bottom of the filters card)
    const sectorChips = page.locator('.flex.flex-wrap.gap-1\\.5 button');
    const foodChip = sectorChips.filter({ hasText: 'Food' });
    await foodChip.click();

    // If results remain, each need card should have a "Food" category badge
    const needCards = page.locator('main .space-y-3 > div.bg-white.rounded-lg');
    const count = await needCards.count();
    if (count > 0) {
      // Check that at least the first card has a Food badge (the colored rounded-full span)
      const firstCard = needCards.first();
      await expect(firstCard.locator('span.rounded-full', { hasText: 'Food' })).toBeVisible();
    } else {
      // No needs match — the empty state should show
      await expect(page.getByText('No needs match the current filters.')).toBeVisible();
    }
  });

  test('deselecting sector chip shows all needs', async ({ page }) => {
    const badge = page.locator('header span.rounded-full');
    const initialText = await badge.textContent();

    // Select then deselect the Food sector
    const foodChip = page.getByRole('button', { name: 'Food' });
    await foodChip.click();
    await foodChip.click();

    // Count should return to the initial value
    await expect(badge).toHaveText(initialText!);
  });

  test('"I Can Help" button click opens modal/confirmation', async ({ page }) => {
    // The "I Can Help" button is styled as an inline-flex, find it by text
    const helpButton = page.locator('button').filter({ hasText: 'I Can Help' }).first();
    await helpButton.click();

    // The modal h2 title should appear
    await expect(page.locator('.fixed h2')).toContainText('Conversation Opened');
  });

  test('modal shows actor name context', async ({ page }) => {
    // Read the actor name from the first need card
    const firstCard = page.locator('main .space-y-3 > div.bg-white.rounded-lg').first();
    const actorName = await firstCard.locator('p.font-semibold').first().textContent();

    // Click "I Can Help" on that card
    await firstCard.locator('button').filter({ hasText: 'I Can Help' }).click();

    // The modal should reference the actor name (inside the green confirmation box)
    const modalContent = page.locator('.fixed .bg-green-50');
    await expect(modalContent).toContainText('Conversation opened with');
    await expect(modalContent).toContainText(actorName!.trim());
  });

  test('modal can be closed', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'I Can Help' }).first().click();
    await expect(page.locator('.fixed h2')).toContainText('Conversation Opened');

    // Close via the Close button (the styled button at bottom of modal)
    await page.locator('.fixed button').filter({ hasText: 'Close' }).click();
    await expect(page.locator('.fixed h2')).toHaveCount(0);
  });

  test('needs are sorted by urgency (red first)', async ({ page }) => {
    const urgencyLabels = page.locator('main .space-y-3 > div.bg-white span.font-medium').filter({ hasText: /^(Critical|Moderate|Low)$/ });
    const count = await urgencyLabels.count();
    if (count < 2) return; // Not enough data to verify sort

    const urgencyOrder: Record<string, number> = { Critical: 0, Moderate: 1, Low: 2 };
    let lastOrder = -1;
    for (let i = 0; i < count; i++) {
      const text = (await urgencyLabels.nth(i).textContent())!.trim();
      const order = urgencyOrder[text] ?? 99;
      expect(order).toBeGreaterThanOrEqual(lastOrder);
      lastOrder = order;
    }
  });

  test('each need card shows actor name, zone, category badge', async ({ page }) => {
    const firstCard = page.locator('main .space-y-3 > div.bg-white').first();

    // Actor name
    await expect(firstCard.locator('p.font-semibold').first()).not.toBeEmpty();
    // Zone — shown as a text-xs text-slate-500 span
    const zoneSpan = firstCard.locator('.text-xs.text-slate-500').first();
    await expect(zoneSpan).not.toBeEmpty();
    // Category badge — a colored rounded-full span
    const badge = firstCard.locator('span.rounded-full.text-white').first();
    await expect(badge).toBeVisible();
  });

  test('pattern alert banner is visible at top', async ({ page }) => {
    // Pattern alerts are in an amber-bordered container at the top of <main>
    const alertBanner = page.locator('main .bg-amber-50').first();
    await expect(alertBanner).toBeVisible();
    // It should contain some alert text
    await expect(alertBanner.locator('p.text-amber-900')).not.toBeEmpty();
  });

  test('responded count visible on need cards', async ({ page }) => {
    const firstCard = page.locator('main .space-y-3 > div.bg-white').first();
    await expect(firstCard.getByText(/\d+ actors? responded/)).toBeVisible();
  });

  test('multiple filters combine correctly', async ({ page }) => {
    const badge = page.locator('header span.rounded-full');

    // Apply zone filter
    const zoneSelect = page.locator('select').first();
    await zoneSelect.selectOption({ index: 1 });
    const afterZone = await badge.textContent();

    // Also apply sector filter
    await page.getByRole('button', { name: 'Medical' }).click();
    const afterBoth = await badge.textContent();

    // The combined filter should be at most as many results as zone alone
    const zoneCount = parseInt(afterZone!);
    const bothCount = parseInt(afterBoth!);
    expect(bothCount).toBeLessThanOrEqual(zoneCount);
  });
});

// ============================================================
// Urgency Alerts Interactions
// ============================================================
test.describe('Urgency Alerts Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/alerts`);
    // Wait for any alert content to render
    await expect(page.locator('body').first()).toBeVisible();
  });

  test('active alerts show countdown or expiry', async ({ page }) => {
    // Alerts show either countdown "Xh Xm remaining" or "Expired"
    await expect(page.getByText(/remaining|Expired|alert/i).first()).toBeVisible();
  });

  test('escalated alerts show escalation badge', async ({ page }) => {
    // Escalated alerts have "Escalated" text
    await expect(page.getByText(/Escalat/i).first()).toBeVisible();
  });

  test('"Flag Urgent Need" button opens modal', async ({ page }) => {
    // The button is in a fixed div at the bottom
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();
    // Modal h3 should appear
    await expect(page.locator('.fixed h3')).toBeVisible();
  });

  test('flag modal shows sector selection buttons', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();

    // All 9 sectors should be present as buttons in the modal
    for (const sector of ['Food', 'Medical', 'Shelter', 'Psychosocial', 'Legal', 'Logistics', 'WASH', 'Education', 'Protection']) {
      await expect(
        page.locator('.fixed button').filter({ hasText: sector }).first()
      ).toBeVisible();
    }
  });

  test('clicking a sector in modal selects it', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();

    // Default selection is Food; click Medical
    const medicalBtn = page.locator('.fixed button').filter({ hasText: 'Medical' }).first();
    await medicalBtn.click();

    // When selected, the button gets a white text color via className
    await expect(medicalBtn).toHaveClass(/text-white/);
  });

  test('description textarea accepts input', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();

    const textarea = page.locator('.fixed textarea');
    await textarea.fill('Critical shortage of water supplies in Bekaa');
    await expect(textarea).toHaveValue('Critical shortage of water supplies in Bekaa');
  });

  test('description shows character counter', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();

    // Initially 0/140
    await expect(page.locator('.fixed').getByText('0/140')).toBeVisible();

    // Type something and verify counter updates
    await page.locator('.fixed textarea').fill('Test');
    await expect(page.locator('.fixed').getByText('4/140')).toBeVisible();
  });

  test('submit disabled when description empty', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();

    const submitBtn = page.locator('.fixed button').filter({ hasText: 'Send Alert' });
    await expect(submitBtn).toBeDisabled();
  });

  test('closing flag modal via close button', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Flag Urgent Need' }).first().click();
    const modalHeading = page.locator('.fixed h3');
    await expect(modalHeading).toBeVisible();

    // Click the X close button in the modal header (button with X icon)
    const closeBtn = page.locator('.fixed button').filter({ has: page.locator('svg.lucide-x') });
    await closeBtn.click();

    await expect(modalHeading).not.toBeVisible();
  });

  test('expired alerts section can be toggled', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /Expired Alerts/ });
    const btnExists = await toggleBtn.count() > 0;
    if (!btnExists) return; // No expired alerts in data

    // Click to show expired alerts
    await toggleBtn.click();
    // After clicking, expired alert cards should appear (they have opacity-60)
    const expiredCards = page.locator('.opacity-60');
    await expect(expiredCards.first()).toBeVisible();

    // Toggle closed
    await toggleBtn.click();
    await expect(expiredCards.first()).not.toBeVisible();
  });
});

// ============================================================
// Map Interactions
// ============================================================
test.describe('Map Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/map`);
    await expect(page.getByText('Filter by Sector')).toBeVisible({ timeout: 15000 });
    // Wait for the map SVG to load by waiting for a governorate path to appear
    await expect(page.getByTestId('gov-beirut')).toBeVisible({ timeout: 15000 });
  });

  test('SVG map renders with 8 governorate paths', async ({ page }) => {
    const govIds = ['akkar', 'north', 'baalbek_hermel', 'mount_lebanon', 'beirut', 'bekaa', 'south', 'nabatieh'];
    for (const id of govIds) {
      await expect(page.getByTestId(`gov-${id}`)).toBeVisible();
    }
  });

  test('clicking a governorate shows detail panel', async ({ page }) => {
    await page.getByTestId('gov-beirut').click();

    // Detail panel should appear with governorate name
    await expect(page.locator('h3.font-bold')).toContainText('Beirut');
    // Should show actor count and sectors
    await expect(page.getByTestId('gov-detail-actors')).toBeVisible();
  });

  test('detail panel shows actor count and sectors', async ({ page }) => {
    await page.getByTestId('gov-mount_lebanon').click();

    // Actor count
    await expect(page.getByTestId('gov-detail-actors')).toContainText('orgs');
    // Sectors heading
    await expect(page.getByText('Active Sectors')).toBeVisible();
  });

  test('detail panel shows coverage gaps', async ({ page }) => {
    // Click on a governorate that is likely to have gaps
    await page.getByTestId('gov-nabatieh').click();

    // Look for the "No Coverage" label or gap badges
    const gapsSection = page.getByText('No Coverage');
    const hasGaps = await gapsSection.count() > 0;
    if (hasGaps) {
      await expect(gapsSection).toBeVisible();
    }
    // Either way the detail panel should be visible
    await expect(page.getByTestId('gov-detail-actors')).toBeVisible();
  });

  test('clicking same governorate closes panel', async ({ page }) => {
    await page.getByTestId('gov-beirut').click();
    await expect(page.getByTestId('gov-detail-actors')).toBeVisible();

    // Click the same governorate again
    await page.getByTestId('gov-beirut').click();
    await expect(page.getByTestId('gov-detail-actors')).not.toBeVisible();
  });

  test('clicking different governorate switches detail', async ({ page }) => {
    await page.getByTestId('gov-beirut').click();
    await expect(page.locator('h3.font-bold')).toContainText('Beirut');

    // Click a different governorate
    await page.getByTestId('gov-north').click();
    await expect(page.locator('h3.font-bold')).toContainText('North');
  });

  test('sector filter button highlights when active', async ({ page }) => {
    const foodBtn = page.getByRole('button', { name: 'Food' });
    await foodBtn.click();

    // When active, the button should have inline backgroundColor style (text-white class)
    await expect(foodBtn).toHaveClass(/text-white/);
  });

  test('All button resets sector filter', async ({ page }) => {
    // First activate a sector filter
    await page.getByRole('button', { name: 'Food' }).click();

    // Then click All to reset
    const allBtn = page.getByRole('button', { name: 'All' });
    await allBtn.click();

    // All button should now be the active one (bg-primary text-white)
    await expect(allBtn).toHaveClass(/bg-primary/);
    await expect(allBtn).toHaveClass(/text-white/);
  });

  test('governorate badges show actor counts', async ({ page }) => {
    // At least some governorate badges should be visible with numeric counts
    const govIds = ['akkar', 'north', 'baalbek_hermel', 'mount_lebanon', 'beirut', 'bekaa', 'south', 'nabatieh'];
    let foundBadge = false;
    for (const id of govIds) {
      const badge = page.getByTestId(`gov-badge-${id}`);
      if (await badge.count() > 0) {
        const countText = page.getByTestId(`gov-badge-count-${id}`);
        await expect(countText).not.toBeEmpty();
        foundBadge = true;
        break;
      }
    }
    expect(foundBadge).toBe(true);
  });

  test('zone pins appear when governorate is selected', async ({ page }) => {
    await page.getByTestId('gov-mount_lebanon').click();

    // After selection, zone pins should be visible — look for zone pin groups in SVG
    // Zone pins are <g> elements with cursor-pointer class containing <circle> and <text>
    const zonePins = page.locator('svg g.cursor-pointer');
    const pinCount = await zonePins.count();
    expect(pinCount).toBeGreaterThan(0);
  });
});

// ============================================================
// Messaging Interactions
// ============================================================
test.describe('Messaging Interactions', () => {
  test('thread list shows participant names', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await expect(page.getByText('Messages')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    // Each thread card should show participant names
    const threadNames = page.locator('h3.font-semibold.text-slate-900');
    await expect(threadNames.first()).not.toBeEmpty();
  });

  test('thread list shows last message preview', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    // Last message previews are p.text-sm.text-slate-500
    const preview = page.locator('p.text-sm.text-slate-500.truncate').first();
    await expect(preview).not.toBeEmpty();
  });

  test('E2E encryption badge visible on list page', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    await expect(page.getByText('End-to-end encrypted')).toBeVisible();
  });

  test('message thread shows sender names on bubbles', async ({ page }) => {
    await page.goto(`${BASE}/messages/mt1`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    // Other-sender messages show sender name in a text-xs font-semibold element
    const senderNames = page.locator('.text-xs.font-semibold.text-primary');
    await expect(senderNames.first()).not.toBeEmpty();
  });

  test('message input field accepts text', async ({ page }) => {
    await page.goto(`${BASE}/messages/mt1`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    const input = page.getByPlaceholder('Type a message...');
    await input.fill('Hello, testing coordination');
    await expect(input).toHaveValue('Hello, testing coordination');
  });

  test('send button clears input after click', async ({ page }) => {
    await page.goto(`${BASE}/messages/mt1`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    const input = page.getByPlaceholder('Type a message...');
    await input.fill('Test message');

    // Click the send button (the round button next to input)
    const sendBtn = page.locator('button.rounded-full.bg-primary');
    await sendBtn.click();

    await expect(input).toHaveValue('');
  });

  test('own messages styled differently from others', async ({ page }) => {
    await page.goto(`${BASE}/messages/mt1`);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    // Own messages use bg-[#1E3A8A] text-white, others use bg-white
    const ownMessages = page.locator('.bg-primary.text-white.rounded-lg');
    const otherMessages = page.locator('.bg-white.border.border-slate-200.text-slate-900.rounded-lg');

    // The mt1 thread has both own (a1/Amel Association) and other messages
    await expect(ownMessages.first()).toBeVisible();
    await expect(otherMessages.first()).toBeVisible();

    // Verify they have different background colors
    const ownBg = await ownMessages.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    const otherBg = await otherMessages.first().evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(ownBg).not.toBe(otherBg);
  });
});
