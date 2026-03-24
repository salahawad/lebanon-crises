import { expect, test } from "@playwright/test";

const BASE = "/en";

test.describe("Filter behavior", () => {
  test("map uses distinct outlines for Bekaa and Baalbek-Hermel", async ({
    page,
  }) => {
    await page.goto(`${BASE}/map`);

    const bekaaPath = await page.getByTestId("gov-bekaa").getAttribute("d");
    const baalbekHermelPath = await page
      .getByTestId("gov-baalbek_hermel")
      .getAttribute("d");

    expect(bekaaPath).toBeTruthy();
    expect(bekaaPath).not.toBe(baalbekHermelPath);
  });

  test("live map sector filter updates the selected governorate detail", async ({
    page,
  }) => {
    await page.goto(`${BASE}/map`);

    await page.getByTestId("gov-beirut").click();
    await expect(page.getByTestId("gov-detail-actors")).not.toHaveText("0 orgs");

    await page.getByRole("button", { name: "Food" }).click();

    await expect(page.getByTestId("gov-detail-actors")).toHaveText("0 orgs");
    await expect(page.getByTestId("gov-detail-gap-food")).toBeVisible();
    await expect(page.getByTestId("gov-detail-sector-food")).toHaveCount(0);
  });

  test("live map sector filter updates governorate badge counts", async ({
    page,
  }) => {
    await page.goto(`${BASE}/map`);

    await expect(page.getByTestId("gov-badge-count-north")).toHaveText("2");

    await page.getByRole("button", { name: "Psychosocial" }).click();

    await expect(page.getByTestId("gov-badge-count-north")).toHaveText("0");
    await expect(page.getByTestId("gov-badge-count-mount_lebanon")).toHaveText(
      "4"
    );
  });

  test("actor registry filters combine as expected", async ({ page }) => {
    await page.goto(`${BASE}/actors`);

    await page.getByRole("button", { name: "Psychosocial" }).click();
    await page.getByRole("button").filter({ has: page.locator("svg") }).first().click();
    await page.getByRole("button", { name: "Grassroots" }).click();
    await page.locator("select").selectOption("dekwaneh");

    await expect(
      page.getByRole("heading", { name: "Dekwaneh Women's Initiative" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Amel Association" })).toHaveCount(0);
  });

  test("needs board filters apply to both alerts and need cards", async ({
    page,
  }) => {
    await page.goto(`${BASE}/needs`);

    await page.locator("select").nth(0).selectOption("saida");

    await expect(page.getByText("Saida Relief Network")).toBeVisible();
    await expect(page.getByText("Amel Association")).toHaveCount(0);
    await expect(
      page.getByText("Medication stock flagged as Low by 2 actors")
    ).toHaveCount(0);
  });

  test("resource tracker zone filter narrows visible resource groups", async ({
    page,
  }) => {
    await page.goto(`${BASE}/resources`);

    await page.locator("select").selectOption("zahle");

    await expect(page.getByRole("heading", { name: "Medical Staff" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hospital Beds" })).toHaveCount(0);
  });

  test("capacity timeline actor filter applies to alert entries too", async ({
    page,
  }) => {
    await page.goto(`${BASE}/timeline`);

    await page.locator("select").nth(1).selectOption("a11");

    await expect(page.getByText("No events match the current filters.")).toBeVisible();
    await expect(page.getByText("Pattern Alert")).toHaveCount(0);
  });
});
