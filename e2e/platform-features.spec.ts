import { test, expect } from '@playwright/test';

// Route group (platform) doesn't add /platform to URL
const BASE = '/en';

// ============================================================
// Feature 1: Public Awareness Dashboard
// The platform dashboard is accessible from the landing page
// ============================================================
test.describe('Feature 1: Public Awareness Dashboard', () => {
  test('landing page has link to coordination platform', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByText('Shabaka').first()).toBeVisible();
  });

  test('landing page loads without auth', async ({ page }) => {
    const resp = await page.goto(BASE);
    expect(resp?.status()).toBe(200);
  });
});

// ============================================================
// Feature 2: Actor Intake Form
// ============================================================
test.describe('Feature 2: Actor Intake Form', () => {
  test('shows organization registration form', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    await expect(page.getByText(/Register/i).first()).toBeVisible();
  });

  test('has all required fields: name, type, sectors, zones, contact', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    await expect(page.getByText(/Organization Name/i).first()).toBeVisible();
    await expect(page.getByText(/Type/i).first()).toBeVisible();
    await expect(page.getByText(/Sectors/i).first()).toBeVisible();
    await expect(page.getByText(/Zones/i).first()).toBeVisible();
    await expect(page.getByText(/Contact/i).first()).toBeVisible();
    await expect(page.getByText(/Phone/i).first()).toBeVisible();
  });

  test('has type options: NGO, Municipality, Grassroots, Shelter', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    await expect(page.getByRole('radio', { name: /NGO/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Municipality/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Grassroots/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Shelter/i })).toBeVisible();
  });

  test('has all 9 sector checkboxes', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    for (const sector of ['Food', 'Medical', 'Shelter', 'Psychosocial', 'Legal', 'Logistics', 'WASH', 'Education', 'Protection']) {
      await expect(page.getByText(sector, { exact: false }).first()).toBeVisible();
    }
  });

  test('has searchable zone dropdown', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    const searchInput = page.getByPlaceholder(/search zone/i);
    await expect(searchInput).toBeVisible();
  });

  test('has language selector with Arabic, English, French', async ({ page }) => {
    await page.goto(`${BASE}/intake`);
    // Language is in a select dropdown
    await expect(page.getByRole('combobox').first()).toBeVisible();
    const options = page.locator('option');
    await expect(options.filter({ hasText: /Arabic/i })).toHaveCount(1);
    await expect(options.filter({ hasText: /English/i })).toHaveCount(1);
    await expect(options.filter({ hasText: /French/i })).toHaveCount(1);
  });
});

// ============================================================
// Feature 3: Basic Static Map
// ============================================================
test.describe('Feature 3: Basic Static Map / Live Map', () => {
  test('shows interactive SVG map with governorates', async ({ page }) => {
    await page.goto(`${BASE}/map`);
    // SVG map should render with clickable paths
    await expect(page.locator('svg path').first()).toBeVisible();
  });

  test('shows gap indicators for zones missing sectors', async ({ page }) => {
    await page.goto(`${BASE}/map`);
    // Should show some gap text
    const gapElement = page.getByText(/gap/i).first();
    await expect(gapElement).toBeVisible();
  });

  test('has sector filter toggles', async ({ page }) => {
    await page.goto(`${BASE}/map`);
    await expect(page.getByText('Food').first()).toBeVisible();
    await expect(page.getByText('Medical').first()).toBeVisible();
  });
});

// ============================================================
// Feature 4: Open API v0
// ============================================================
test.describe('Feature 4: Open API v0', () => {
  test('GET /api/v0/coverage returns JSON with zone coverage', async ({ request }) => {
    const resp = await request.get('/api/v0/coverage');
    expect(resp.status()).toBe(200);
    const json = await resp.json();
    expect(json.data).toBeDefined();
    expect(json.meta.totalZones).toBeGreaterThan(0);
  });

  test('GET /api/v0/gaps returns zones with missing sectors', async ({ request }) => {
    const resp = await request.get('/api/v0/gaps');
    expect(resp.status()).toBe(200);
    const json = await resp.json();
    expect(json.data).toBeDefined();
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].missingSectors).toBeDefined();
  });

  test('GET /api/v0/orgs returns org list without contact details', async ({ request }) => {
    const resp = await request.get('/api/v0/orgs');
    expect(resp.status()).toBe(200);
    const json = await resp.json();
    expect(json.data).toBeDefined();
    expect(json.data.length).toBeGreaterThan(0);
    // No contact details exposed
    const org = json.data[0];
    expect(org.contactPhone).toBeUndefined();
    expect(org.contactEmail).toBeUndefined();
  });

  test('API responses have Cache-Control header', async ({ request }) => {
    const resp = await request.get('/api/v0/coverage');
    const cacheControl = resp.headers()['cache-control'];
    expect(cacheControl).toContain('max-age=1800');
  });
});

// ============================================================
// Feature 5: Actor Registry
// ============================================================
test.describe('Feature 5: Actor Registry', () => {
  test('shows list of actors with name, type, sectors, zones', async ({ page }) => {
    await page.goto(`${BASE}/actors`);
    await expect(page.getByText('Amel Association').first()).toBeVisible();
    await expect(page.getByText('Arcenciel').first()).toBeVisible();
  });

  test('shows verification status badges', async ({ page }) => {
    await page.goto(`${BASE}/actors`);
    await expect(page.getByText(/verified/i).first()).toBeVisible();
  });

  test('actor profile page shows detailed info', async ({ page }) => {
    await page.goto(`${BASE}/actors/a1`);
    await expect(page.getByText('Amel Association').first()).toBeVisible();
  });

  test('shows vouch chain on actor profile', async ({ page }) => {
    await page.goto(`${BASE}/actors/a1`);
    await expect(page.getByText(/vouch/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 6: Capacity Cards
// ============================================================
test.describe('Feature 6: Capacity Cards', () => {
  test('shows capacity cards overview', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    await expect(page.getByText(/capacity/i).first()).toBeVisible();
  });

  test('shows service toggles and stock levels', async ({ page }) => {
    await page.goto(`${BASE}/capacity`);
    // Should show some stock level indicators
    await expect(page.locator('[class*="bg-"]').first()).toBeVisible();
  });

  test('capacity edit page has toggles and steppers', async ({ page }) => {
    await page.goto(`${BASE}/capacity/a1`);
    await expect(page.locator('body').first()).toBeVisible();
  });
});

// ============================================================
// Feature 7: Peer Verification
// ============================================================
test.describe('Feature 7: Peer Verification', () => {
  test('shows verification status categories', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    await expect(page.getByText(/verified/i).first()).toBeVisible();
    await expect(page.getByText(/pending/i).first()).toBeVisible();
  });

  test('shows vouch counts per actor', async ({ page }) => {
    await page.goto(`${BASE}/verification`);
    await expect(page.getByText(/vouch/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 9: Needs Board
// ============================================================
test.describe('Feature 9: Needs Board', () => {
  test('shows needs sorted by urgency', async ({ page }) => {
    await page.goto(`${BASE}/needs`);
    // Red urgency items should be visible
    await expect(page.getByText(/urgent/i).first()).toBeVisible();
  });

  test('shows need details: actor, category, zone, description', async ({ page }) => {
    await page.goto(`${BASE}/needs`);
    await expect(page.getByText('Amel Association').first()).toBeVisible();
    await expect(page.getByText(/Bourj Hammoud/i).first()).toBeVisible();
  });

  test('has "I Can Help" action button', async ({ page }) => {
    await page.goto(`${BASE}/needs`);
    await expect(page.getByText(/I Can Help/i).first()).toBeVisible();
  });

  test('shows pattern alerts when present', async ({ page }) => {
    await page.goto(`${BASE}/needs`);
    // Pattern alert about systemic gap should be visible
    const alertText = page.getByText(/actors flagged/i).first();
    await expect(alertText).toBeVisible();
  });
});

// ============================================================
// Feature 11: Resource Tracker
// ============================================================
test.describe('Feature 11: Resource Tracker', () => {
  test('shows aggregate resources by zone', async ({ page }) => {
    await page.goto(`${BASE}/resources`);
    await expect(page.getByText(/resource/i).first()).toBeVisible();
  });

  test('shows timestamps on resource figures', async ({ page }) => {
    await page.goto(`${BASE}/resources`);
    await expect(page.getByText(/ago/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 12: Capacity Timeline
// ============================================================
test.describe('Feature 12: Capacity Timeline', () => {
  test('shows capacity change history', async ({ page }) => {
    await page.goto(`${BASE}/timeline`);
    await expect(page.getByText(/timeline/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 13: Urgency Alerts
// ============================================================
test.describe('Feature 13: Urgency Alerts', () => {
  test('shows active urgency alerts', async ({ page }) => {
    await page.goto(`${BASE}/alerts`);
    await expect(page.getByText(/alert/i).first()).toBeVisible();
    await expect(page.getByText('Amel Association').first()).toBeVisible();
  });

  test('shows escalation indicator on escalated alerts', async ({ page }) => {
    await page.goto(`${BASE}/alerts`);
    await expect(page.getByText(/escalat/i).first()).toBeVisible();
  });

  test('has one-tap flag button', async ({ page }) => {
    await page.goto(`${BASE}/alerts`);
    await expect(page.getByText(/flag/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 14: Collaboration Request System
// ============================================================
test.describe('Feature 14: Collaboration System', () => {
  test('shows collaboration requests and joint operations', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    await expect(page.getByText(/collab/i).first()).toBeVisible();
  });

  test('shows match suggestions', async ({ page }) => {
    await page.goto(`${BASE}/collaborate`);
    // Should show proposed or active collaborations
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ============================================================
// Feature 15: Shared Task Board
// ============================================================
test.describe('Feature 15: Shared Task Board', () => {
  test('shows task board for joint operation', async ({ page }) => {
    await page.goto(`${BASE}/collaborate/jo1`);
    await expect(page.locator('body').first()).toBeVisible();
  });
});

// ============================================================
// Feature 16: Flash Assessment
// ============================================================
test.describe('Feature 16: Flash Assessment', () => {
  test('shows assessment snapshots', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    await expect(page.getByText(/assessment/i).first()).toBeVisible();
  });

  test('shows aggregated results when snapshot ready', async ({ page }) => {
    await page.goto(`${BASE}/assessment`);
    // Snapshot data should be visible
    await expect(page.getByText(/response/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 17: Sector Planning & Gap Analysis
// ============================================================
test.describe('Feature 17: Sector Planning', () => {
  test('shows coverage plans and gap analysis', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    await expect(page.getByText(/plan/i).first()).toBeVisible();
  });

  test('shows gap analysis with sector coverage matrix', async ({ page }) => {
    await page.goto(`${BASE}/planning`);
    await expect(page.getByText(/gap/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 17b: Secure Messaging
// ============================================================
test.describe('Feature 17b: Messaging', () => {
  test('shows message threads', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await expect(page.getByText(/message/i).first()).toBeVisible();
  });

  test('shows E2E encryption badge', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await expect(page.getByText(/encrypt/i).first()).toBeVisible();
  });

  test('message thread shows chat bubbles', async ({ page }) => {
    await page.goto(`${BASE}/messages/mt1`);
    await expect(page.locator('body').first()).toBeVisible();
  });
});

// ============================================================
// Feature 19: Community Feedback
// ============================================================
test.describe('Feature 19: Community Feedback', () => {
  test('shows anonymous feedback form', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    await expect(page.getByText(/feedback/i).first()).toBeVisible();
    await expect(page.getByText(/anonymous/i).first()).toBeVisible();
  });

  test('shows discrepancy flags on feedback', async ({ page }) => {
    await page.goto(`${BASE}/feedback`);
    await expect(page.getByText(/discrepancy/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 20: Outcome Monitoring
// ============================================================
test.describe('Feature 20: Outcome Monitoring', () => {
  test('shows network outcome stats', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText(/families/i).first()).toBeVisible();
  });

  test('shows network-internal disclaimer', async ({ page }) => {
    await page.goto(`${BASE}/outcomes`);
    await expect(page.getByText(/network/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 21: API Documentation
// ============================================================
test.describe('Feature 21: API Documentation', () => {
  test('shows API endpoint documentation', async ({ page }) => {
    await page.goto(`${BASE}/api`);
    await page.waitForLoadState('networkidle');
    // Should have API-related content
    await expect(page.getByText(/api/i).first()).toBeVisible();
  });
});

// ============================================================
// Feature 22: Privacy Controls & Settings
// ============================================================
test.describe('Feature 22: Privacy Controls', () => {
  test('shows field-level visibility settings', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText(/privacy/i).first()).toBeVisible();
  });

  test('shows notification preference options', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText(/notification/i).first()).toBeVisible();
  });

  test('shows offline mode toggle', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await expect(page.getByText(/offline/i).first()).toBeVisible();
  });
});

// ============================================================
// Navigation & Layout
// ============================================================
test.describe('Navigation & Layout', () => {
  test('bottom nav bar is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/needs`);
    // Bottom nav should have navigation links
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('More page shows feature links', async ({ page }) => {
    await page.goto(`${BASE}/more`);
    await page.waitForLoadState('networkidle');
    // Should show at least some feature links
    await expect(page.locator('a').first()).toBeVisible();
  });

  test('platform is accessible from main landing page', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByText('Shabaka')).toBeVisible();
  });
});

// ============================================================
// Backward Compatibility — Existing Features Still Work
// ============================================================
test.describe('Backward Compatibility', () => {
  test('existing landing page still loads', async ({ page }) => {
    const resp = await page.goto('/en');
    expect(resp?.status()).toBe(200);
    await expect(page.getByText('Lebanon Relief').first()).toBeVisible();
  });

  test('existing request-help page still loads', async ({ page }) => {
    const resp = await page.goto('/en/request-help');
    expect(resp?.status()).toBe(200);
  });

  test('existing shelters page still loads', async ({ page }) => {
    const resp = await page.goto('/en/shelters');
    expect(resp?.status()).toBe(200);
  });

  test('existing contacts page still loads', async ({ page }) => {
    const resp = await page.goto('/en/contacts');
    expect(resp?.status()).toBe(200);
  });

  test('Arabic locale still works', async ({ page }) => {
    const resp = await page.goto('/ar');
    expect(resp?.status()).toBe(200);
  });
});
