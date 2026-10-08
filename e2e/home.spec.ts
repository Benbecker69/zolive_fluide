import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("presents the brand, the categories and the favourite products", async ({ page }) => {
    await page.goto("/fr");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "L'huile d'olive, tout simplement bonne.",
    );

    const categories = page.getByRole("region", { name: "Tout pour une bonne table." });
    await expect(categories.getByRole("listitem")).toHaveCount(4);

    const favourites = page.getByRole("region", { name: "Les préférées du moment" });
    await expect(favourites.getByRole("heading", { level: 3 })).toHaveText([
      "Fruité vert",
      "Fruité mûr",
      "Le bidon",
      "Tapenade noire",
    ]);
    await expect(favourites.getByText("24 €")).toBeVisible();
  });

  test("leads to the shop from the main call to action", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("link", { name: "Découvrir la boutique" }).click();
    await expect(page).toHaveURL(/\/fr\/boutique$/);
  });

  test("leads to a filtered listing from a category tile", async ({ page }) => {
    await page.goto("/fr");
    await page
      .getByRole("region", { name: "Tout pour une bonne table." })
      .getByRole("link", { name: "Coffrets" })
      .click();
    await expect(page).toHaveURL(/\/fr\/boutique\?category=coffrets$/);
  });

  test("leads to a product page from a favourite product", async ({ page }) => {
    await page.goto("/fr");
    await page
      .getByRole("region", { name: "Les préférées du moment" })
      .getByRole("link", { name: "Le bidon" })
      .click();
    await expect(page).toHaveURL(/\/fr\/produits\/le-bidon$/);
  });

  test("leads to the matching oil from the taste guide", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("link", { name: "Goûter le fruité noir" }).click();
    await expect(page).toHaveURL(/\/fr\/produits\/fruite-noir$/);
  });

  test("reaches the mill section from the main navigation", async ({ page }) => {
    await page.goto("/fr/boutique");
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Le moulin" })
      .click();
    await expect(page).toHaveURL(/\/fr#moulin$/);
    await expect(
      page.getByRole("heading", { name: "Du verger à la bouteille, sans détour." }),
    ).toBeInViewport();
  });

  test("is in English on the English site", async ({ page }) => {
    await page.goto("/en");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Olive oil, quite simply good.",
    );
    await expect(
      page
        .getByRole("region", { name: "Current favourites" })
        .getByRole("heading", { level: 3 })
        .first(),
    ).toHaveText("Green fruity");
    await expect(page.getByText("€24.00").first()).toBeVisible();
  });

  test("is served from the cache once it has been generated", async ({ request }) => {
    await request.get("/fr");
    const second = await request.get("/fr");

    expect(second.status()).toBe(200);
    expect(second.headers()["x-nextjs-cache"]).toBe("HIT");
  });

  test("loads nothing from a third-party domain", async ({ page }) => {
    const origins = new Set<string>();
    page.on("request", (request) => origins.add(new URL(request.url()).origin));
    await page.goto("/fr", { waitUntil: "networkidle" });

    expect([...origins]).toEqual([new URL(page.url()).origin]);
  });

  for (const width of [390, 1440]) {
    test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/fr");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const locale of ["fr", "en"]) {
    test(`has no serious or critical accessibility violation in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`);
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
