import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const productNames = (page: Page) => page.getByRole("listitem").getByRole("heading", { level: 3 });

test.describe("shop listing", () => {
  test("lists the whole catalogue and announces the number of products", async ({ page }) => {
    await page.goto("/fr/boutique");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toute la boutique");
    await expect(productNames(page)).toHaveCount(9);
    await expect(page.getByRole("status")).toHaveText("9 produits");
    await expect(page.getByRole("link", { name: "Tout", exact: true })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("filters by category, and the filter lives in the URL", async ({ page }) => {
    await page.goto("/fr/boutique");
    await page.getByRole("link", { name: "Olives et tapenades" }).click();

    await expect(page).toHaveURL(/\/fr\/boutique\?category=olives-et-tapenades$/);
    await expect(productNames(page)).toHaveText(["Olives vertes cassées", "Tapenade noire"]);
    await expect(page.getByRole("status")).toHaveText("2 produits");

    // The same URL, opened from scratch, shows the same list.
    await page.goto("/fr/boutique?category=olives-et-tapenades");
    await expect(productNames(page)).toHaveText(["Olives vertes cassées", "Tapenade noire"]);
  });

  test("sorts by price and keeps the active filter", async ({ page }) => {
    await page.goto("/fr/boutique?category=huiles-d-olive");
    await page.getByLabel("Trier par").selectOption("price-asc");
    await page.getByRole("button", { name: "Trier" }).click();

    await expect(page).toHaveURL(/category=huiles-d-olive/);
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(productNames(page)).toHaveText([
      "Huile au citron",
      "Fruité mûr",
      "Fruité vert",
      "Fruité noir",
      "Le bidon",
    ]);
  });

  test("falls back to the full list for unknown parameters", async ({ page }) => {
    const response = await page.goto("/fr/boutique?category=voitures&sort=random");

    expect(response?.status()).toBe(200);
    await expect(productNames(page)).toHaveCount(9);
  });

  test("shows names and prices in English on the English site", async ({ page }) => {
    await page.goto("/en/boutique");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The whole shop");
    await expect(productNames(page).first()).toHaveText("Green fruity");
    await expect(page.getByText("€24.00")).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("9 products");
  });

  test("is reachable from the main navigation", async ({ page }) => {
    await page.goto("/fr");
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Boutique" })
      .click();
    await expect(page).toHaveURL(/\/fr\/boutique$/);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("filters and sorts with plain links and a form", async ({ page }) => {
      await page.goto("/fr/boutique");
      await page.getByRole("link", { name: "Coffrets" }).click();
      await expect(productNames(page)).toHaveText(["Le coffret découverte"]);

      await page.goto("/fr/boutique");
      await page.getByLabel("Trier par").selectOption("price-desc");
      await page.getByRole("button", { name: "Trier" }).click();
      await expect(productNames(page).first()).toHaveText("Le coffret découverte");
    });
  });

  for (const locale of ["fr", "en"]) {
    test(`has no serious or critical accessibility violation in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/boutique`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    });
  }
});
