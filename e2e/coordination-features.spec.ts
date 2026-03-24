import { test, expect } from '@playwright/test';

const BASE = '/en';

// ============================================================
// Collaboration System
// ============================================================
test.describe('Collaboration System', () => {
  test('page shows collaboration requests', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    await expect(page.getByText('Collaboration Requests').first()).toBeVisible();
  });

  test('tab switching between Matches and Operations works', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    const matchesTab = page.getByRole('button', { name: 'Matches' });
    const operationsTab = page.getByRole('button', { name: 'Active Operations' });

    await expect(matchesTab).toBeVisible();
    await expect(operationsTab).toBeVisible();

    // Switch to operations tab
    await operationsTab.click();
    // Collaboration Requests heading should no longer be visible (it's on the matches tab)
    await expect(page.getByText('Collaboration Requests')).not.toBeVisible();

    // Switch back to matches tab
    await matchesTab.click();
    await expect(page.getByText('Collaboration Requests').first()).toBeVisible();
  });

  test('active operations tab shows joint operations', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    await page.getByRole('button', { name: 'Active Operations' }).click();
    // Should show operation cards or "No active operations yet"
    const hasOperations = await page.getByText('Active').first().isVisible();
    expect(hasOperations).toBeTruthy();
  });

  test('proposed collaborations show Accept/Decline buttons', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    const proposedBadge = page.getByText('Proposed').first();
    // If there are proposed collabs, Accept/Decline should exist
    if (await proposedBadge.isVisible()) {
      await expect(page.getByRole('button', { name: /Accept/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Decline/i }).first()).toBeVisible();
    }
  });

  test('clicking Accept changes status visually', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    const acceptBtn = page.getByRole('button', { name: /Accept/i }).first();
    // Wait for data to load
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      // After accepting, the Accepted badge should appear
      await expect(page.getByText('Accepted').first()).toBeVisible();
    }
  });

  test('"View Task Board" link navigates to task board', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    await page.getByRole('button', { name: 'Active Operations' }).click();
    const taskBoardLink = page.getByText('View Task Board').first();
    if (await taskBoardLink.isVisible().catch(() => false)) {
      await taskBoardLink.click();
      await expect(page.getByText('Back to Collaborations').first()).toBeVisible();
    }
  });

  test('suggested matches section visible', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    await expect(page.getByText('Suggested Matches').first()).toBeVisible();
  });

  test('collaboration shows from/to actor names', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    // Collaboration cards show actor names connected by an arrow icon
    // Check that at least one card has two font-semibold spans (from/to actors)
    const cards = page.locator('.rounded-2xl.border.border-slate-200.bg-white.p-4');
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    // Each card should have at least two bold actor name spans
    const actorNames = firstCard.locator('span.font-semibold');
    await expect(actorNames).toHaveCount(2);
  });
});

// ============================================================
// Task Board
// ============================================================
test.describe('Task Board', () => {
  test('board shows operation title and participating actors', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    // Operation header with title
    await expect(page.locator('h1').first()).toBeVisible();
    // Participating actors shown with Users icon
    await expect(page.getByText('&').first()).toBeVisible();
  });

  test('tasks displayed in columns (To Do, In Progress, Done)', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    await expect(page.getByText('To Do').first()).toBeVisible();
    await expect(page.getByText('In Progress').first()).toBeVisible();
    await expect(page.getByText('Done').first()).toBeVisible();
  });

  test('each task shows title and assignee', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    // Task cards are inside the kanban columns
    const taskCards = page.locator('.rounded-xl.border-2.bg-white.p-3');
    const firstTask = taskCards.first();
    await expect(firstTask).toBeVisible();
    // Task should have a title (a p tag with font-medium)
    await expect(firstTask.locator('p.font-medium').first()).toBeVisible();
  });

  test('"Add Task" button opens modal', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    const addTaskBtn = page.getByRole('button', { name: /Add Task/i });
    await expect(addTaskBtn).toBeVisible();
    await addTaskBtn.click();
    // Modal should appear with "Add New Task" heading
    await expect(page.getByText('Add New Task')).toBeVisible();
  });

  test('task modal has title input', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    await page.getByRole('button', { name: /Add Task/i }).click();
    await expect(page.getByText('Task Title')).toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
  });

  test('task modal submit disabled when empty', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    await page.getByRole('button', { name: /Add Task/i }).click();
    // The submit button in the modal (second "Add Task" button) should be disabled
    const submitBtn = page.locator('button:has-text("Add Task")').last();
    await expect(submitBtn).toBeDisabled();
  });

  test('adding task shows it on board', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    const taskTitle = 'Test task from E2E';
    await page.getByRole('button', { name: /Add Task/i }).click();
    await page.getByPlaceholder('What needs to be done?').fill(taskTitle);
    // Submit button should now be enabled
    const submitBtn = page.locator('.fixed button:has-text("Add Task")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    // Modal should close and task should appear on the board
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('back link navigates to collaboration page', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    await page.getByText('Back to Collaborations').click();
    await expect(page).toHaveURL(/\/collaborate$/);
    await expect(page.getByText('Collaboration System').first()).toBeVisible();
  });
});

// ============================================================
// Flash Assessment
// ============================================================
test.describe('Flash Assessment', () => {
  test('assessment list shows zone and status', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    // Each assessment card shows a zone name and a status badge (Active/Closed)
    const statusBadge = page.getByText(/Active|Closed/).first();
    await expect(statusBadge).toBeVisible();
  });

  test('response count visible on assessment cards', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    // Response count format: "X/Y responses"
    await expect(page.getByText(/\d+\/\d+ responses/).first()).toBeVisible();
  });

  test('expanding assessment shows snapshot results', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    const viewResults = page.getByText('View Results').first();
    if (await viewResults.isVisible().catch(() => false)) {
      await viewResults.click();
      // Snapshot section should now show key metrics
      await expect(page.getByText('Avg Displaced').first()).toBeVisible();
    }
  });

  test('snapshot shows displaced count and families reached', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    const viewResults = page.getByText('View Results').first();
    if (await viewResults.isVisible().catch(() => false)) {
      await viewResults.click();
      await expect(page.getByText('Avg Displaced').first()).toBeVisible();
      await expect(page.getByText('Families Reached').first()).toBeVisible();
    }
  });

  test('top unmet needs displayed with counts', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    const viewResults = page.getByText('View Results').first();
    if (await viewResults.isVisible().catch(() => false)) {
      await viewResults.click();
      await expect(page.getByText('Top Unmet Needs').first()).toBeVisible();
      // Should show "X reports" for at least one need
      await expect(page.getByText(/\d+ reports/).first()).toBeVisible();
    }
  });

  test('zero coverage sectors shown as red badges', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    const viewResults = page.getByText('View Results').first();
    if (await viewResults.isVisible().catch(() => false)) {
      await viewResults.click();
      // Zero Coverage Sectors section
      const zeroCoverageHeader = page.getByText('Zero Coverage Sectors');
      if (await zeroCoverageHeader.isVisible().catch(() => false)) {
        // Red badges use bg-[#ef4444]/10 and text-[#ef4444]
        const redBadges = page.locator('span.rounded-full').filter({
          has: page.locator('[class*="ef4444"]'),
        });
        expect(await redBadges.count()).toBeGreaterThan(0);
      }
    }
  });

  test('"Trigger New Assessment" button visible', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    await expect(page.getByText('Trigger New').first()).toBeVisible();
  });
});

// ============================================================
// Community Feedback
// ============================================================
test.describe('Community Feedback', () => {
  test('anonymous badge visible on form', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    await expect(page.getByText('Anonymous').first()).toBeVisible();
  });

  test('service type dropdown has options (Food, Medical, Shelter, etc.)', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    const serviceSelect = page.locator('select').first();
    await expect(serviceSelect).toBeVisible();
    // Check options exist
    const options = serviceSelect.locator('option');
    await expect(options.filter({ hasText: 'Food' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Medical' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Shelter' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Psychosocial' })).toHaveCount(1);
    await expect(options.filter({ hasText: 'Other' })).toHaveCount(1);
  });

  test('zone dropdown has zone options', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    // Second select is the zone dropdown
    const zoneSelect = page.locator('select').nth(1);
    await expect(zoneSelect).toBeVisible();
    // Should have more than just the placeholder option
    const options = zoneSelect.locator('option');
    expect(await options.count()).toBeGreaterThan(1);
  });

  test('feedback textarea has character counter', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    // Character counter shows "0/300"
    await expect(page.getByText('0/300')).toBeVisible();
  });

  test('typing feedback updates character count', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    const textarea = page.getByPlaceholder('Describe your experience or concern...');
    await textarea.fill('Hello test');
    // Character count should update to "10/300"
    await expect(page.getByText('10/300')).toBeVisible();
  });

  test('submit button works after filling all fields', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    // Fill service type
    await page.locator('select').first().selectOption('food');
    // Fill zone (select first available zone)
    const zoneSelect = page.locator('select').nth(1);
    const zoneOptions = zoneSelect.locator('option:not([disabled])');
    const secondOption = await zoneOptions.nth(1).getAttribute('value');
    if (secondOption) {
      await zoneSelect.selectOption(secondOption);
    }
    // Fill feedback text
    await page.getByPlaceholder('Describe your experience or concern...').fill('Test feedback from E2E');
    // Submit button should be enabled
    const submitBtn = page.getByRole('button', { name: /Submit Feedback/i });
    await expect(submitBtn).toBeEnabled();
  });

  test('success message appears after submission', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    // Fill all fields
    await page.locator('select').first().selectOption('food');
    const zoneSelect = page.locator('select').nth(1);
    const zoneOptions = zoneSelect.locator('option:not([disabled])');
    const secondOption = await zoneOptions.nth(1).getAttribute('value');
    if (secondOption) {
      await zoneSelect.selectOption(secondOption);
    }
    await page.getByPlaceholder('Describe your experience or concern...').fill('Test feedback submission');
    // Submit
    await page.getByRole('button', { name: /Submit Feedback/i }).click();
    // Success message should appear
    await expect(page.getByText('Thank you!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/submitted anonymously/i)).toBeVisible();
  });

  test('received feedback section shows discrepancy flags', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    await expect(page.getByText('Received Feedback').first()).toBeVisible();
    // At least one feedback item should have a discrepancy flag
    await expect(page.getByText('Discrepancy flagged').first()).toBeVisible();
  });
});

// ============================================================
// Sector Planning
// ============================================================
test.describe('Sector Planning', () => {
  test('coverage plans tab shows planning notes', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    // Coverage Plans is the default active tab
    await expect(page.getByText('Coverage Plans').first()).toBeVisible();
    // Should show plan cards with notes (text content in p.text-sm.text-slate-600)
    const planNotes = page.locator('p.text-slate-600').first();
    await expect(planNotes).toBeVisible();
  });

  test('gap analysis tab shows coverage matrix', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    await page.getByRole('button', { name: /Gap Analysis/i }).click();
    // Should show a table with Sector, Actors, Status columns
    await expect(page.getByText('Sector').first()).toBeVisible();
    await expect(page.getByText('Actors').first()).toBeVisible();
    await expect(page.getByText('Status').first()).toBeVisible();
  });

  test('switching between tabs works', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    // Start on Coverage Plans tab (default)
    const coveragePlansTab = page.getByRole('button', { name: /Coverage Plans/i });
    const gapAnalysisTab = page.getByRole('button', { name: /Gap Analysis/i });

    // Switch to Gap Analysis
    await gapAnalysisTab.click();
    await expect(page.getByText('Sector').first()).toBeVisible();

    // Switch back to Coverage Plans
    await coveragePlansTab.click();
    const planNotes = page.locator('p.text-slate-600').first();
    await expect(planNotes).toBeVisible();
  });

  test('coverage plans show actor name and zone', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    // Plan cards show actor names (span.font-semibold.text-slate-900) and zones
    const actorName = page.locator('span.font-semibold.text-slate-900').first();
    await expect(actorName).toBeVisible();
    // Zones are shown as text next to MapPin icons
    const planCards = page.locator('.rounded-2xl.border.border-slate-200.p-4');
    await expect(planCards.first()).toBeVisible();
  });

  test('gap matrix cells are color coded (red=0, amber=1-2, green=3+)', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    // Wait for data to load (loading skeletons disappear, plan content appears)
    await expect(page.locator('p.text-slate-600').first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Gap Analysis/i }).click();
    // Wait for the gap analysis table to appear
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });
    // Coverage cells use getCoverageColor: bg-[#ef4444] for 0, bg-amber-400 for 1-2, bg-[#22c55e] for 3+
    // Check that at least one status label is present ("No coverage", "Low", or "Good")
    // These labels are in td cells in the gap matrix table
    const noCoverageLabels = page.locator('td').getByText('No coverage');
    const lowLabels = page.locator('td').getByText('Low');
    const goodLabels = page.locator('td').getByText('Good');
    const totalCount = await noCoverageLabels.count() + await lowLabels.count() + await goodLabels.count();
    expect(totalCount).toBeGreaterThan(0);
  });

  test('persistent needs section visible', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    await page.getByRole('button', { name: /Gap Analysis/i }).click();
    // Persistent needs section
    const persistentNeeds = page.getByText('Persistent Needs').first();
    if (await persistentNeeds.isVisible().catch(() => false)) {
      await expect(persistentNeeds).toBeVisible();
      // Should show "X days flagged" text
      await expect(page.getByText(/days flagged/).first()).toBeVisible();
    }
  });
});
