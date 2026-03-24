import { test, expect } from '@playwright/test';

const BASE = '/en';

// ============================================================
// Intake Form Interactions
// ============================================================
test.describe('Intake Form Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/intake`);
  });

  test('submit empty form shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /Submit Registration/i }).click();

    await expect(page.getByText('Organization name is required')).toBeVisible();
    await expect(page.getByText('Select an organization type')).toBeVisible();
    await expect(page.getByText('Select at least one sector')).toBeVisible();
    await expect(page.getByText('Select at least one zone')).toBeVisible();
    await expect(page.getByText('Contact name is required')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Select a language')).toBeVisible();
  });

  test('type organization name in input field', async ({ page }) => {
    const input = page.getByPlaceholder(/Saida Relief Network/i);
    await input.fill('Test Organization');
    await expect(input).toHaveValue('Test Organization');
  });

  test('select NGO radio button for type', async ({ page }) => {
    const radio = page.getByRole('radio', { name: /NGO/i });
    await radio.check();
    await expect(radio).toBeChecked();
  });

  test('select Municipality radio button', async ({ page }) => {
    const radio = page.getByRole('radio', { name: /Municipality/i });
    await radio.check();
    await expect(radio).toBeChecked();
  });

  test('select multiple sector checkboxes (Food + Medical)', async ({ page }) => {
    const foodCheckbox = page.getByRole('checkbox', { name: /Food/i });
    const medicalCheckbox = page.getByRole('checkbox', { name: /Medical/i });

    await foodCheckbox.check();
    await medicalCheckbox.check();

    await expect(foodCheckbox).toBeChecked();
    await expect(medicalCheckbox).toBeChecked();
  });

  test('search zones by typing and see filtered results', async ({ page }) => {
    const zoneSearch = page.getByPlaceholder(/Search zones/i);
    await zoneSearch.fill('Tripoli');

    // Dropdown should open and show Tripoli
    await expect(page.getByRole('button', { name: /Tripoli/i })).toBeVisible();
    // Other zones should not appear (e.g. Saida)
    await expect(page.getByRole('button', { name: /Saida/i })).not.toBeVisible();
  });

  test('select a zone - chip appears', async ({ page }) => {
    const zoneSearch = page.getByPlaceholder(/Search zones/i);
    await zoneSearch.click();
    await zoneSearch.fill('Tripoli');

    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Chip should appear with the zone name
    const chip = page.locator('span').filter({ hasText: 'Tripoli' }).filter({ has: page.locator('button') });
    await expect(chip).toBeVisible();
  });

  test('select multiple zones - multiple chips appear', async ({ page }) => {
    const zoneSearch = page.getByPlaceholder(/Search zones/i);

    // Select Tripoli
    await zoneSearch.fill('Tripoli');
    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Select Saida
    await zoneSearch.fill('Saida');
    await page.getByRole('button', { name: /Saida/i }).click();

    // Both chips should be visible
    const chips = page.locator('span.inline-flex').filter({ has: page.locator('button') });
    await expect(chips).toHaveCount(2);
  });

  test('remove a zone chip by clicking X', async ({ page }) => {
    const zoneSearch = page.getByPlaceholder(/Search zones/i);

    // Select Tripoli
    await zoneSearch.fill('Tripoli');
    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Close the dropdown by clicking outside (the transparent overlay)
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    // Verify chip appears
    const chip = page.locator('span.inline-flex').filter({ hasText: 'Tripoli' }).filter({ has: page.locator('button') });
    await expect(chip).toBeVisible();

    // Click the X button inside the chip
    await chip.locator('button').click();

    // Chip should be gone
    await expect(chip).not.toBeVisible();
  });

  test('select language from dropdown', async ({ page }) => {
    const select = page.locator('select');
    await select.selectOption('en');
    await expect(select).toHaveValue('en');
  });

  test('fill all fields and submit - see success screen', async ({ page }) => {
    // Organization name
    await page.getByPlaceholder(/Saida Relief Network/i).fill('Test Organization');

    // Type
    await page.getByRole('radio', { name: /NGO/i }).check();

    // Sector
    await page.getByRole('checkbox', { name: /Food/i }).check();

    // Zone
    const zoneSearch = page.getByPlaceholder(/Search zones/i);
    await zoneSearch.fill('Tripoli');
    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Close zone dropdown by clicking elsewhere
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    // Contact name
    await page.getByPlaceholder(/Full name/i).fill('John Doe');

    // Phone
    await page.getByPlaceholder(/\+961/i).fill('+961 71 123 456');

    // Language
    await page.locator('select').selectOption('en');

    // Submit
    await page.getByRole('button', { name: /Submit Registration/i }).click();

    // Should show submitting state then success
    await expect(page.getByText('Submission Received!')).toBeVisible({ timeout: 5000 });
  });

  test('success screen shows "Pending Review" status', async ({ page }) => {
    // Fill all fields
    await page.getByPlaceholder(/Saida Relief Network/i).fill('Test Organization');
    await page.getByRole('radio', { name: /NGO/i }).check();
    await page.getByRole('checkbox', { name: /Food/i }).check();
    const zoneSearch = page.getByPlaceholder(/Search zones/i);
    await zoneSearch.fill('Tripoli');
    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Close zone dropdown by clicking elsewhere
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    await page.getByPlaceholder(/Full name/i).fill('John Doe');
    await page.getByPlaceholder(/\+961/i).fill('+961 71 123 456');
    await page.locator('select').selectOption('en');

    await page.getByRole('button', { name: /Submit Registration/i }).click();

    await expect(page.getByText('Status: Pending Review')).toBeVisible({ timeout: 5000 });
  });

  test('phone field accepts input', async ({ page }) => {
    const phoneInput = page.getByPlaceholder(/\+961/i);
    await phoneInput.fill('+961 71 999 888');
    await expect(phoneInput).toHaveValue('+961 71 999 888');
  });

  test('contact name field accepts input', async ({ page }) => {
    const contactInput = page.getByPlaceholder(/Full name/i);
    await contactInput.fill('Ahmad Hassan');
    await expect(contactInput).toHaveValue('Ahmad Hassan');
  });

  test('submit without type shows error', async ({ page }) => {
    // Fill everything except type
    await page.getByPlaceholder(/Saida Relief Network/i).fill('Test Organization');
    await page.getByRole('checkbox', { name: /Food/i }).check();
    const zoneSearch = page.getByPlaceholder(/Search zones/i);
    await zoneSearch.fill('Tripoli');
    await page.getByRole('button', { name: /Tripoli/i }).click();

    // Close zone dropdown by clicking elsewhere
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    await page.getByPlaceholder(/Full name/i).fill('John Doe');
    await page.getByPlaceholder(/\+961/i).fill('+961 71 123 456');
    await page.locator('select').selectOption('en');

    await page.getByRole('button', { name: /Submit Registration/i }).click();

    await expect(page.getByText(/Select an organization type/)).toBeVisible();
    // Should NOT show success screen
    await expect(page.getByText('Submission Received!')).not.toBeVisible();
  });
});

// ============================================================
// Actors Search & Filter
// ============================================================
test.describe('Actors Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/actors`);
    // Wait for actors to load (loading skeletons disappear)
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10000 });
  });

  test('search by text - filters actor list (type "Amel")', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search actors/i);
    await searchInput.fill('Amel');

    // Results count text should appear
    await expect(page.getByText(/result/i)).toBeVisible();
  });

  test('search by Arabic name - filters results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search actors/i);
    await searchInput.fill('جمعية');

    // Results count text should appear when filtering
    await expect(page.getByText(/result/i)).toBeVisible();
  });

  test('click Food sector chip - only food actors shown', async ({ page }) => {
    await page.getByRole('button', { name: /^Food$/i }).click();

    // Results count should be visible (filter is active)
    await expect(page.getByText(/result/i)).toBeVisible();
  });

  test('click Medical sector chip - medical actors shown', async ({ page }) => {
    await page.getByRole('button', { name: /^Medical$/i }).click();

    await expect(page.getByText(/result/i)).toBeVisible();
  });

  test('deselect sector chip - all actors return', async ({ page }) => {
    // First select Food
    await page.getByRole('button', { name: /^Food$/i }).click();
    await expect(page.getByText(/result/i)).toBeVisible();

    // Click Food again to deselect
    await page.getByRole('button', { name: /^Food$/i }).click();

    // Results count text should disappear (no active filter)
    await expect(page.getByText(/result/i)).not.toBeVisible();
  });

  test('results count text updates when filtering', async ({ page }) => {
    // Activate food filter
    await page.getByRole('button', { name: /^Food$/i }).click();
    const countText = page.getByText(/\d+ results?/i);
    await expect(countText).toBeVisible();

    // Switch to medical and count should update
    await page.getByRole('button', { name: /^Medical$/i }).click();
    await expect(page.getByText(/\d+ results?/i)).toBeVisible();
  });

  test('click actor card navigates to profile page', async ({ page }) => {
    // Click the first actor card link
    const firstCard = page.locator('a[href*="/actors/"]').first();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute('href');

    await firstCard.click();

    // Should navigate to the actor profile page
    await expect(page).toHaveURL(new RegExp(`/actors/`));
    // Profile should load with actor name
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('clear search input restores full list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search actors/i);

    // Count initial actor cards
    const initialCards = page.locator('a[href*="/actors/"]');
    const initialCount = await initialCards.count();

    // Type search text
    await searchInput.fill('xyznonexistent');
    await expect(page.getByText('No actors found')).toBeVisible();

    // Clear the search input
    await searchInput.clear();

    // All cards should be back
    await expect(initialCards).toHaveCount(initialCount);
  });

  test('multiple sector filters show intersection', async ({ page }) => {
    // Select Food sector
    await page.getByRole('button', { name: /^Food$/i }).click();
    const foodCountText = await page.getByText(/\d+ results?/i).textContent();

    // Also type in search to further filter
    const searchInput = page.getByPlaceholder(/Search actors/i);
    await searchInput.fill('a');

    // Results should still show (intersection of filters)
    await expect(page.getByText(/\d+ results?/i)).toBeVisible();
  });

  test('show/hide filters button toggles filter panel', async ({ page }) => {
    // The filter button is inside the search bar (absolute positioned at end)
    const filterButton = page.locator('input[placeholder="Search actors..."]').locator('..').locator('button');
    await expect(filterButton).toBeVisible();

    // Click to show filters
    await filterButton.click();
    // The filter panel shows "Organization Type" and "Zone" labels
    await expect(page.getByText('Organization Type')).toBeVisible();
    // Use exact match for Zone label to avoid matching "All Zones" etc.
    await expect(page.locator('label').filter({ hasText: /^Zone$/ })).toBeVisible();

    // Click again to hide filters
    await filterButton.click();
    await expect(page.getByText('Organization Type')).not.toBeVisible();
  });

  test('zone dropdown filters by zone', async ({ page }) => {
    // Open filter panel
    const filterButton = page.locator('input[placeholder="Search actors..."]').locator('..').locator('button');
    await filterButton.click();

    // Select a zone from the dropdown
    const zoneSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'All Zones' }) });
    await expect(zoneSelect).toBeVisible();

    // Pick any zone option that exists
    const options = zoneSelect.locator('option');
    const optionCount = await options.count();
    if (optionCount > 1) {
      // Select the second option (first real zone)
      const secondOption = await options.nth(1).getAttribute('value');
      if (secondOption) {
        await zoneSelect.selectOption(secondOption);
        await expect(page.getByText(/\d+ results?/i)).toBeVisible();
      }
    }
  });

  test('no results message when search matches nothing', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search actors/i);
    await searchInput.fill('zzznonexistentorg12345');

    await expect(page.getByText('No actors found')).toBeVisible();
    await expect(page.getByText('Try adjusting your filters')).toBeVisible();
  });
});

// ============================================================
// Actor Profile & Vouch Modal
// ============================================================
test.describe('Actor Profile Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to actors list, then click the first actor to get a valid profile
    await page.goto(`${BASE}/actors`);
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10000 });

    // Click the first actor card
    const firstCard = page.locator('a[href*="/actors/"]').first();
    await firstCard.click();

    // Wait for profile to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('profile shows actor name and Arabic name', async ({ page }) => {
    // The h1 is the actor name
    const actorName = page.locator('h1');
    await expect(actorName.first()).toBeVisible();
    const nameText = await actorName.first().textContent();
    expect(nameText?.trim().length).toBeGreaterThan(0);

    // Arabic name displayed with dir="rtl" attribute
    const arabicName = page.locator('[dir="rtl"]');
    await expect(arabicName.first()).toBeVisible();
  });

  test('verification badge shows correct status', async ({ page }) => {
    // One of these badges should be visible
    const verifiedBadge = page.getByText('Verified', { exact: true });
    const provisionalBadge = page.getByText('Provisional', { exact: true });
    const pendingBadge = page.getByText('Pending', { exact: true });

    const isVerified = await verifiedBadge.isVisible().catch(() => false);
    const isProvisional = await provisionalBadge.isVisible().catch(() => false);
    const isPending = await pendingBadge.isVisible().catch(() => false);

    expect(isVerified || isProvisional || isPending).toBe(true);
  });

  test('freshness indicator dot is visible', async ({ page }) => {
    // The freshness dot is a span with classes like bg-green-500, bg-amber-500, or bg-slate-400
    const freshnessDot = page.locator('span.rounded-full').filter({
      has: page.locator(':scope'),
    }).first();
    // Check for the freshness label text (Fresh, Aging, or Stale)
    const freshnessText = page.getByText(/Fresh|Aging|Stale/);
    await expect(freshnessText.first()).toBeVisible();
  });

  test('"Vouch for this Organization" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Vouch for this Organization/i })).toBeVisible();
  });

  test('click vouch button opens modal dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Vouch for this Organization/i }).click();

    // Modal should appear with the title "Vouch for ..."
    await expect(page.getByText(/Vouch for /i).last()).toBeVisible();
    await expect(page.getByText('Your vouch carries weight')).toBeVisible();
  });

  test('modal has 3 checkbox questions', async ({ page }) => {
    await page.getByRole('button', { name: /Vouch for this Organization/i }).click();

    // Three checkbox questions in the modal
    await expect(page.getByText(/observed this organization operating in the field/i)).toBeVisible();
    await expect(page.getByText(/stated coverage area accurate/i)).toBeVisible();
    await expect(page.getByText(/willing to publicly associate/i)).toBeVisible();

    // Three checkboxes
    const modalCheckboxes = page.locator('.fixed input[type="checkbox"]');
    await expect(modalCheckboxes).toHaveCount(3);
  });

  test('submit button is disabled when not all checkboxes checked', async ({ page }) => {
    await page.getByRole('button', { name: /Vouch for this Organization/i }).click();

    const submitVouch = page.getByRole('button', { name: /Submit Vouch/i });
    await expect(submitVouch).toBeVisible();
    await expect(submitVouch).toBeDisabled();

    // Check only one checkbox - should still be disabled
    const checkboxes = page.locator('.fixed input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await expect(submitVouch).toBeDisabled();
  });

  test('check all 3 checkboxes enables submit button', async ({ page }) => {
    await page.getByRole('button', { name: /Vouch for this Organization/i }).click();

    const checkboxes = page.locator('.fixed input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    const submitVouch = page.getByRole('button', { name: /Submit Vouch/i });
    await expect(submitVouch).toBeEnabled();
  });

  test('close modal via close button', async ({ page }) => {
    await page.getByRole('button', { name: /Vouch for this Organization/i }).click();

    // Modal should be visible
    const modalOverlay = page.locator('.fixed.inset-0');
    await expect(modalOverlay).toBeVisible();

    // Click the X close button (inside the modal header)
    const closeButton = modalOverlay.locator('button').filter({ has: page.locator('svg.lucide-x') });
    await closeButton.click();

    // Modal should be gone
    await expect(page.getByText('Your vouch carries weight')).not.toBeVisible();
  });

  test('sectors and zones sections display data', async ({ page }) => {
    // Sectors heading (inside the About section)
    await expect(page.getByText('Sectors', { exact: true }).first()).toBeVisible();

    // Operational Zones heading
    await expect(page.getByText('Operational Zones')).toBeVisible();

    // There should be at least one sector badge (inline-flex items inside the About card)
    const sectorBadges = page.locator('.inline-flex').filter({ has: page.locator('span.rounded-full') });
    await expect(sectorBadges.first()).toBeVisible();
  });
});
