import { test, expect } from "@playwright/test";

// Samsung Galaxy S26 Ultra viewport
const S26_ULTRA = { width: 412, height: 915 };
const S26_UA =
  "Mozilla/5.0 (Linux; Android 16; Samsung SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

test.describe("News Ticker on Galaxy S26 Ultra", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(S26_ULTRA);
    await page.setExtraHTTPHeaders({ "User-Agent": S26_UA });
  });

  test("ticker renders and has news items", async ({ page }) => {
    await page.goto("/en");

    // Wait for ticker
    const ticker = page.locator(".fixed.bottom-0");
    await expect(ticker).toBeVisible({ timeout: 15000 });

    // Check news links exist
    const links = ticker.locator("a[target='_blank']");
    const count = await links.count();
    console.log(`S26 Ultra: ${count} news links in ticker`);
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("ticker scrolls (transform changes over time)", async ({ page }) => {
    await page.goto("/en");

    const ticker = page.locator(".fixed.bottom-0");
    await expect(ticker).toBeVisible({ timeout: 15000 });

    // Get the wrapper that has will-change-transform
    const wrapper = ticker.locator(".will-change-transform");
    await expect(wrapper).toBeVisible({ timeout: 10000 });

    // Capture transform at t=0
    const t1 = await wrapper.evaluate((el) => el.style.transform);

    // Wait 2 seconds
    await page.waitForTimeout(2000);

    // Capture transform at t=2s
    const t2 = await wrapper.evaluate((el) => el.style.transform);

    console.log(`Transform t=0: "${t1}", t=2s: "${t2}"`);
    // Should have moved (different transform values)
    expect(t2).not.toBe(t1);
    expect(t2).toContain("translateX");
  });

  test("ticker headline text is readable (not empty)", async ({ page }) => {
    await page.goto("/en");

    const ticker = page.locator(".fixed.bottom-0");
    await expect(ticker).toBeVisible({ timeout: 15000 });

    const headlines = ticker.locator("span[dir='rtl']");
    await expect(headlines.first()).toBeVisible({ timeout: 10000 });

    const firstText = await headlines.first().textContent();
    console.log(`First headline: "${firstText?.substring(0, 60)}"`);
    expect(firstText?.trim().length).toBeGreaterThan(5);
  });

  test("no JS errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/en");
    await page.waitForTimeout(3000);

    console.log(`JS errors: ${errors.length}`, errors);
    expect(errors.length).toBe(0);
  });

  test("api/news is reachable from mobile", async ({ page, request }) => {
    const res = await request.get("/api/news");
    expect(res.status()).toBe(200);
    const data = await res.json();
    console.log(`API returned ${data.items?.length} items`);
    expect(data.items?.length).toBeGreaterThanOrEqual(1);
  });

  test("screenshot for visual check", async ({ page }) => {
    await page.goto("/en");
    await page.waitForTimeout(5000);
    await page.screenshot({ path: ".test-artifacts/s26-ultra-ticker.png", fullPage: false });
  });
});
