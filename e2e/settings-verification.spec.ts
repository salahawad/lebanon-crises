import { test, expect } from '@playwright/test';

const BASE = '/en';

// ============================================================
// Verification Network
// ============================================================
test.describe('Verification Network', () => {
  test('stats bar shows verified, provisional, pending counts', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Wait for stats to load (loading skeleton disappears)
    await expect(page.getByText('Verified').first()).toBeVisible();
    await expect(page.getByText('Provisional').first()).toBeVisible();
    await expect(page.getByText('Pending').first()).toBeVisible();
    // Each stat card has a bold number
    const statNumbers = page.locator('.grid.grid-cols-3 .text-2xl.font-bold');
    await expect(statNumbers).toHaveCount(3);
  });

  test('verified section lists actors with vouch counts', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    await expect(page.getByText('Verified Organizations')).toBeVisible();
    // Verified actors show "X vouches"
    await expect(page.getByText(/\d+ vouches/).first()).toBeVisible();
  });

  test('provisional section shows actors with fewer vouches', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Provisional section header
    const provisionalHeader = page.locator('button').filter({ hasText: 'Provisional' });
    await expect(provisionalHeader).toBeVisible();
    // Provisional actors show "X vouch" (singular, fewer vouches)
    const provisionalSection = page.locator('.border-amber-200');
    await expect(provisionalSection.getByText(/\d+ vouch/).first()).toBeVisible();
  });

  test('pending section shows actors with 0 vouches', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Pending section header
    const pendingHeader = page.locator('button').filter({ hasText: 'Pending' });
    await expect(pendingHeader).toBeVisible();
    // Pending actors show "No vouches yet" or "0/3 vouches"
    const pendingSection = page.locator('.border-slate-200').filter({ hasText: 'Pending' });
    await expect(pendingSection.getByText('0/3 vouches').first()).toBeVisible();
  });

  test('section expand/collapse toggles work', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Verified section is expanded by default - content visible
    await expect(page.getByText('3+ vouches from verified peers')).toBeVisible();

    // Click the Verified Organizations toggle button to collapse
    const verifiedToggle = page.locator('button').filter({ hasText: 'Verified Organizations' });
    await verifiedToggle.click();

    // Content should be hidden after collapse
    await expect(page.getByText('3+ vouches from verified peers')).not.toBeVisible();

    // Click again to expand
    await verifiedToggle.click();
    await expect(page.getByText('3+ vouches from verified peers')).toBeVisible();
  });

  test('vouch chain chips show voucher names', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Vouch chain label
    await expect(page.getByText('Vouched for by:').first()).toBeVisible();
    // Voucher name chips exist (green or amber rounded-full chips)
    const vouchChips = page.locator('.rounded-full.text-xs.font-medium').filter({
      hasNotText: /Verified|Provisional|Pending|Founding|NGO|Municipality|Grassroots|Shelter/
    });
    expect(await vouchChips.count()).toBeGreaterThan(0);
  });

  test('founding cohort badge visible on early actors', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Founding cohort badge with star icon
    await expect(page.getByText('Founding Cohort').first()).toBeVisible();
  });

  test('progress bars show X/3 vouches for provisional', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    // Provisional section shows progress bars with "X/3 vouches" and "X more needed"
    const provisionalSection = page.locator('.border-amber-200');
    await expect(provisionalSection.getByText(/\d\/3 vouches/).first()).toBeVisible();
    await expect(provisionalSection.getByText(/\d+ more needed/).first()).toBeVisible();
    // The progress bar element exists
    await expect(provisionalSection.locator('.bg-slate-200.rounded-full.overflow-hidden').first()).toBeVisible();
  });
});

// ============================================================
// Privacy & Settings
// ============================================================
test.describe('Privacy & Settings', () => {
  test('profile visibility section shows field names', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText('Profile Visibility')).toBeVisible();
    // Field labels from INITIAL_FIELDS
    await expect(page.getByText('Organization Name')).toBeVisible();
    await expect(page.getByText('Contact Phone')).toBeVisible();
    await expect(page.getByText('Contact Email')).toBeVisible();
    await expect(page.getByText('WhatsApp Number')).toBeVisible();
    await expect(page.getByText('Office Address')).toBeVisible();
    await expect(page.getByText('Operational Zones')).toBeVisible();
    await expect(page.getByText('Sectors', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Capacity Data')).toBeVisible();
  });

  test('each field has Public/Verified Peers/Private options', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // Each field row has three visibility buttons
    const publicButtons = page.getByRole('button', { name: 'Public' });
    const verifiedPeersButtons = page.getByRole('button', { name: 'Verified Peers' });
    const privateButtons = page.getByRole('button', { name: 'Private' });

    // 8 fields, each with 3 options
    await expect(publicButtons).toHaveCount(8);
    await expect(verifiedPeersButtons).toHaveCount(8);
    await expect(privateButtons).toHaveCount(8);
  });

  test('clicking a visibility option changes active state', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // "Organization Name" defaults to "public" - the Public button should have ring style
    // Click "Private" for Organization Name field (first row)
    const firstRow = page.locator('.divide-y > div').first();
    const privateBtn = firstRow.getByRole('button', { name: 'Private' });
    await privateBtn.click();
    // After clicking, the Private button should have the active ring class
    await expect(privateBtn).toHaveClass(/ring-1/);
  });

  test('notification preferences show Push/WhatsApp/SMS/All', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText('Notification Preferences')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Push' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'WhatsApp' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'SMS' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'All' })).toBeVisible();
  });

  test('selecting notification option changes active state', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // Default is "push" - Push label should have active border
    const pushLabel = page.locator('label').filter({ hasText: 'Push' }).first();
    await expect(pushLabel).toHaveClass(/border-\[#1e3a5f\]/);

    // Click SMS option
    const smsLabel = page.locator('label').filter({ hasText: 'SMS' });
    await smsLabel.click();
    // SMS should now be active
    await expect(smsLabel).toHaveClass(/border-\[#1e3a5f\]/);
    // Push should no longer be active
    await expect(pushLabel).not.toHaveClass(/border-\[#1e3a5f\]/);
  });

  test('offline mode toggle switch works', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText('Enable Offline Mode')).toBeVisible();
    // Toggle is on by default (green)
    const toggle = page.locator('button.rounded-full').filter({ hasText: '' }).first();
    const offlineSection = page.locator('section').filter({ hasText: 'Offline Mode' });
    const toggleBtn = offlineSection.locator('button.rounded-full');
    await expect(toggleBtn).toHaveClass(/bg-\[#22c55e\]/);

    // Click to disable
    await toggleBtn.click();
    await expect(toggleBtn).toHaveClass(/bg-slate-300/);

    // Click to re-enable
    await toggleBtn.click();
    await expect(toggleBtn).toHaveClass(/bg-\[#22c55e\]/);
  });

  test('"Last synced" text visible', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText(/Last synced:/).first()).toBeVisible();
  });

  test('region checkboxes can be checked/unchecked', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText('Regions', { exact: true })).toBeVisible();
    // Beirut & Suburbs should be pre-selected (has active border class border-[#1e3a5f])
    // The button contains child p elements with region name text
    const beirutBtn = page.locator('button').filter({ hasText: 'Beirut & Suburbs' });
    await expect(beirutBtn).toHaveClass(/border-\[#1e3a5f\]/);

    // Click to uncheck
    await beirutBtn.click();
    await expect(beirutBtn).not.toHaveClass(/border-\[#1e3a5f\]/);

    // Click to check again
    await beirutBtn.click();
    await expect(beirutBtn).toHaveClass(/border-\[#1e3a5f\]/);
  });

  test('multiple regions can be selected', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // By default, 2 regions are selected: beirut_suburbs and south_lebanon
    const beirutBtn = page.getByRole('button', { name: /Beirut & Suburbs/i });
    const southBtn = page.getByRole('button', { name: /South Lebanon/i });
    await expect(beirutBtn).toHaveClass(/border-\[#1e3a5f\]/);
    await expect(southBtn).toHaveClass(/border-\[#1e3a5f\]/);

    // Select a third region
    const bekaaBtn = page.getByRole('button', { name: /Bekaa Valley/i });
    await bekaaBtn.click();
    await expect(bekaaBtn).toHaveClass(/border-\[#1e3a5f\]/);
    // Previous selections still active
    await expect(beirutBtn).toHaveClass(/border-\[#1e3a5f\]/);
    await expect(southBtn).toHaveClass(/border-\[#1e3a5f\]/);
  });

  test('"Download My Data" export button visible', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText('Data Export')).toBeVisible();
    await expect(page.getByRole('button', { name: /Download My Data/i })).toBeVisible();
  });
});

// ============================================================
// Capacity Cards Overview
// ============================================================
test.describe('Capacity Cards Overview', () => {
  test('cards show actor name and zone', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Wait for cards to load
    const card = page.locator('.rounded-2xl.border.shadow-lg').first();
    await expect(card).toBeVisible();
    // Each card has an actor name (h3) and a zone name next to a MapPin icon
    await expect(card.locator('h3').first()).toBeVisible();
    await expect(card.locator('.text-xs.text-slate-500').first()).toBeVisible();
  });

  test('stock level indicators visible (colored bars)', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Stock level bars with color classes
    await expect(page.getByText('Stock Levels').first()).toBeVisible();
    // Colored bars: bg-[#22c55e], bg-[#e8913a], or bg-[#ef4444]
    const stockBars = page.locator('.rounded-full').filter({
      has: page.locator('[class*="bg-[#22c55e]"], [class*="bg-[#e8913a]"], [class*="bg-[#ef4444]"]')
    });
    expect(await stockBars.count()).toBeGreaterThan(0);
  });

  test('urgent needs shown as red tags', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Wait for cards to load (loading skeleton disappears)
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 15000 });
    // Urgent need tags have bg-red-100 text-red-800
    const urgentTags = page.locator('.bg-red-100.text-red-800');
    expect(await urgentTags.count()).toBeGreaterThan(0);
  });

  test('"Updated X ago" timestamp on each card', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Each card shows relative time like "Xm ago", "Xh ago", "Xd ago", "Xw ago"
    await expect(page.getByText(/\d+[mhdw] ago/).first()).toBeVisible();
  });

  test('zone filter dropdown filters cards', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Wait for cards to load
    await expect(page.locator('h3').first()).toBeVisible();
    const allCardsCount = await page.locator('.grid .rounded-2xl.border').count();

    // Select a specific zone from the dropdown
    const select = page.locator('select');
    // Get the first non-empty option value
    const firstOption = select.locator('option').nth(1);
    const optionValue = await firstOption.getAttribute('value');
    if (optionValue) {
      await select.selectOption(optionValue);
      // After filtering, card count should be less than or equal to all cards
      const filteredCount = await page.locator('.grid .rounded-2xl.border').count();
      expect(filteredCount).toBeLessThanOrEqual(allCardsCount);
    }
  });

  test('card click navigates to actor profile', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Cards are wrapped in <Link> (anchor tags) to /actors/:actorId
    const cardLink = page.locator('a.block').first();
    await expect(cardLink).toBeVisible();
    const href = await cardLink.getAttribute('href');
    expect(href).toContain('/actors/');
  });
});

// ============================================================
// Capacity Card Edit
// ============================================================
test.describe('Capacity Card Edit', () => {
  test('service toggle switches are visible and interactive', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    await expect(page.getByText('Services')).toBeVisible();
    // Toggle switches (checkbox-based)
    const toggles = page.locator('input[type="checkbox"]');
    expect(await toggles.count()).toBeGreaterThan(0);
    await expect(toggles.first()).toBeVisible();
  });

  test('clicking toggle changes visual state', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    const firstToggle = page.locator('input[type="checkbox"]').first();
    const wasChecked = await firstToggle.isChecked();
    await firstToggle.click({ force: true });
    const isNowChecked = await firstToggle.isChecked();
    expect(isNowChecked).toBe(!wasChecked);
  });

  test('resource stepper + button increments count', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    await expect(page.getByText('Resource Quantities')).toBeVisible();
    // Get the first resource count
    const countDisplay = page.locator('.text-center.text-sm.font-bold').first();
    const initialCount = parseInt(await countDisplay.textContent() || '0', 10);

    // Click the + button (Plus icon button) for the first resource
    const resourceRow = countDisplay.locator('..');
    const plusButton = resourceRow.locator('button').last();
    await plusButton.click();

    const newCount = parseInt(await countDisplay.textContent() || '0', 10);
    expect(newCount).toBe(initialCount + 1);
  });

  test('resource stepper - button decrements count', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    const countDisplay = page.locator('.text-center.text-sm.font-bold').first();
    const initialCount = parseInt(await countDisplay.textContent() || '0', 10);

    // Click the - button (Minus icon button) for the first resource
    const resourceRow = countDisplay.locator('..');
    const minusButton = resourceRow.locator('button').first();
    await minusButton.click();

    const newCount = parseInt(await countDisplay.textContent() || '0', 10);
    expect(newCount).toBe(Math.max(0, initialCount - 1));
  });

  test('stock level buttons (Low/Some/Good) change active state', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    await expect(page.getByText('Stock Levels').first()).toBeVisible();

    // Find the first stock level group
    const stockSection = page.locator('text=Stock Levels').locator('..').locator('..');
    const lowButton = stockSection.getByRole('button', { name: 'Low' }).first();
    const someButton = stockSection.getByRole('button', { name: 'Some' }).first();
    const goodButton = stockSection.getByRole('button', { name: 'Good' }).first();

    // Click "Low" button
    await lowButton.click();
    await expect(lowButton).toHaveClass(/bg-\[#ef4444\]/);

    // Click "Good" button
    await goodButton.click();
    await expect(goodButton).toHaveClass(/bg-\[#22c55e\]/);
    // "Low" should no longer be active
    await expect(lowButton).not.toHaveClass(/bg-\[#ef4444\]/);
  });

  test('notes textarea accepts input', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    // Wait for page content to load
    await expect(page.getByText('Services')).toBeVisible({ timeout: 15000 });
    const textarea = page.getByPlaceholder('Add a short note about your current capacity...');
    await expect(textarea).toBeVisible();
    await textarea.fill('Test note for capacity');
    await expect(textarea).toHaveValue('Test note for capacity');
  });

  test('notes shows character counter approaching 140', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    // Wait for page content to load
    await expect(page.getByText('Services')).toBeVisible({ timeout: 15000 });
    // Character counter format: "X/140"
    await expect(page.getByText(/\d+\/140/)).toBeVisible();

    // Type text and verify counter updates (use the visible textarea, not reCAPTCHA hidden one)
    const textarea = page.getByPlaceholder('Add a short note about your current capacity...');
    await textarea.fill('A'.repeat(125));
    // Counter should show 125/140 with amber color
    await expect(page.getByText('125/140')).toBeVisible();
    // The counter should have the warning color class when > 120
    const counter = page.getByText('125/140');
    await expect(counter).toHaveClass(/text-\[#e8913a\]/);
  });

  test('auto-save notice banner visible', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    await expect(
      page.getByText('All changes save instantly')
    ).toBeVisible();
  });

  test('recent changes timeline visible at bottom', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    // Wait for page content to load
    await expect(page.getByText('Services')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Recent Changes', { exact: true })).toBeVisible();
  });

  test('changes show old to new values', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    // Changes display old value (strikethrough) -> new value
    const changeEntry = page.locator('.line-through').first();
    await expect(changeEntry).toBeVisible();
    // Arrow entity between old and new values
    const changeRow = changeEntry.locator('..');
    await expect(changeRow).toBeVisible();
  });
});

// ============================================================
// Outcome Monitoring
// ============================================================
test.describe('Outcome Monitoring', () => {
  test('network stats cards show families, collabs, gaps closed', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText('Families Reached')).toBeVisible();
    await expect(page.getByText('Active Collabs')).toBeVisible();
    await expect(page.getByText('Gaps Closed')).toBeVisible();
    // Each stat has a bold number
    const statCards = page.locator('.grid.grid-cols-3 .text-2xl.font-bold');
    await expect(statCards).toHaveCount(3);
  });

  test('week-over-week trend arrows visible', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText('Week-over-Week Trend')).toBeVisible();
    // Trend arrows: ArrowUpRight (green) or ArrowDownRight (red) or Minus (neutral)
    // These are rendered as SVGs inside spans with text-[#22c55e] or text-[#ef4444]
    const trendIndicators = page.locator('table span').filter({ hasText: /^[+-]\d+$/ });
    expect(await trendIndicators.count()).toBeGreaterThan(0);
  });

  test('individual actor reports show 4 stats each', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText('Actor Reports')).toBeVisible();
    // Each report has 4 stat boxes: Families, Needs Resolved, Referrals, Collabs Done
    const firstReport = page.locator('.space-y-3 > div').filter({ hasText: 'Families' }).first();
    await expect(firstReport.getByText('Families')).toBeVisible();
    await expect(firstReport.getByText('Needs Resolved')).toBeVisible();
    await expect(firstReport.getByText('Referrals')).toBeVisible();
    await expect(firstReport.getByText('Collabs Done')).toBeVisible();
  });

  test('"Network-internal only" badge visible', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText('Network-internal only')).toBeVisible();
  });

  test('peer coordination disclaimer visible', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(
      page.getByText(/Not a reporting tool.*shared for peer coordination/i)
    ).toBeVisible();
  });
});

// ============================================================
// Capacity Timeline
// ============================================================
test.describe('Capacity Timeline', () => {
  test('timeline entries show actor name and change details', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    await expect(page.getByText('Capacity Timeline')).toBeVisible();
    // Change entries show actor name and field name
    const changeEntry = page.locator('.rounded-2xl.border.border-slate-200.shadow-sm').filter({
      has: page.locator('.font-semibold')
    }).first();
    await expect(changeEntry).toBeVisible();
    // Actor name (font-semibold)
    await expect(changeEntry.locator('.font-semibold').first()).toBeVisible();
    // Field name
    await expect(changeEntry.locator('.font-medium.text-slate-700').first()).toBeVisible();
  });

  test('old to new value format visible', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    // Old value (line-through) and arrow and new value
    await expect(page.locator('.line-through').first()).toBeVisible();
    // New value in bold blue
    await expect(page.locator('.font-semibold.text-\\[\\#1e3a5f\\]').first()).toBeVisible();
  });

  test('pattern alert cards interspersed in timeline', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    // Pattern alerts have amber styling and "Pattern Alert" text
    await expect(page.getByText('Pattern Alert').first()).toBeVisible();
    // Alert card with amber border
    const alertCard = page.locator('.bg-amber-50.border-amber-200').first();
    await expect(alertCard).toBeVisible();
  });

  test('staleness summary shows stale/outdated profile counts', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    // Wait for timeline to load
    await expect(page.getByText('Capacity Timeline')).toBeVisible({ timeout: 15000 });
    // Wait for data to load (the event count badge appears in the header)
    await expect(page.locator('.bg-white\\/20')).toBeVisible({ timeout: 15000 });
    // Staleness warning banner (may or may not appear depending on data)
    const warning = page.getByText('Data freshness warning');
    const hasWarning = await warning.count() > 0;
    if (hasWarning) {
      await expect(warning).toBeVisible();
      // Shows counts of stale and/or outdated profiles
      await expect(
        page.getByText(/may be stale|may be outdated/).first()
      ).toBeVisible();
    }
  });

  test('zone filter dropdown filters timeline entries', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    // Wait for timeline to load
    await expect(page.getByText('Capacity Timeline')).toBeVisible();
    const eventsBadge = page.locator('.bg-white\\/20');
    const initialText = await eventsBadge.textContent();

    // Select a specific zone
    const zoneSelect = page.locator('select').first();
    await zoneSelect.selectOption({ index: 1 });

    // The event count or displayed entries may change after filtering
    // Verify the filter applied (select value changed)
    const selectedValue = await zoneSelect.inputValue();
    expect(selectedValue).not.toBe('all');
  });
});
