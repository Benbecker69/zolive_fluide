import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("product page", () => {
  test("shows the product, its formats and its tasting profile", async ({ page }) => {
    await page.goto("/fr/produits/fruite-vert");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fruité vert");
    await expect(page.getByText("Picholine")).toBeVisible();
    await expect(page.getByRole("radio", { name: "50 cl" })).toBeChecked();
    await expect(page.getByText("24 €", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("soit 48 € le litre")).toBeVisible();
    await expect(page.getByRole("img", { name: "Fruité : 5 sur 5" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Amertume : 3 sur 5" })).toBeVisible();
  });

  test("updates the price, the price per litre and the total with the format and quantity", async ({
    page,
  }) => {
    await page.goto("/fr/produits/fruite-vert");

    await page.getByRole("radio", { name: "75 cl" }).check();
    await expect(page.getByText("33 €", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("soit 44 € le litre")).toBeVisible();

    await page.getByRole("button", { name: "Augmenter la quantité" }).click();
    await expect(page.getByRole("button", { name: "Ajouter au panier 66 €" })).toBeVisible();

    // Changing the format starts again from one unit.
    await page.getByRole("radio", { name: "25 cl" }).check();
    await expect(page.getByRole("button", { name: "Ajouter au panier 14 €" })).toBeVisible();
  });

  test("lets the keyboard choose a format with the arrow keys", async ({ page }) => {
    await page.goto("/fr/produits/fruite-vert");

    await page.getByRole("radio", { name: "50 cl" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "75 cl" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "75 cl" })).toBeFocused();
  });

  test("marks a format out of stock as unavailable", async ({ page }) => {
    await page.goto("/fr/produits/fruite-noir");

    const soldOut = page.getByRole("radio", { name: "75 cl indisponible" });
    await expect(soldOut).toBeDisabled();
    await expect(page.getByRole("radio", { name: "50 cl" })).toBeChecked();
  });

  test("has no price per litre for a product sold by weight", async ({ page }) => {
    await page.goto("/fr/produits/tapenade-noire");

    await expect(page.getByText("9 €", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/le litre/)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Profil de dégustation" })).toHaveCount(0);
  });

  test("is reachable from the shop listing and suggests other products", async ({ page }) => {
    await page.goto("/fr/boutique");
    await page.getByRole("link", { name: "Fruité mûr" }).click();

    await expect(page).toHaveURL(/\/fr\/produits\/fruite-mur$/);
    const related = page.getByRole("region", { name: "À goûter aussi" });
    await expect(related.getByRole("heading", { level: 3 })).toHaveCount(4);
    // Products of the same category come first.
    await expect(related.getByRole("heading", { level: 3 }).first()).toHaveText("Fruité vert");
  });

  test("links back to the listing of its category", async ({ page }) => {
    await page.goto("/fr/produits/tapenade-noire");
    await page
      .getByRole("navigation", { name: "Fil d'Ariane" })
      .getByRole("link", { name: "Olives et tapenades" })
      .click();
    await expect(page).toHaveURL(/\/fr\/boutique\?category=olives-et-tapenades$/);
  });

  test("shows the localized not-found page for an unknown product", async ({ page }) => {
    const response = await page.goto("/en/produits/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  });

  test("is in English on the English site", async ({ page }) => {
    await page.goto("/en/produits/fruite-vert");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Green fruity");
    await expect(page.getByText("€24.00", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("that is €48.00 per litre")).toBeVisible();
    await expect(page.getByRole("img", { name: "Fruitiness: 5 out of 5" })).toBeVisible();
  });

  test("is served from the cache once it has been generated", async ({ request }) => {
    await request.get("/fr/produits/le-bidon");
    const second = await request.get("/fr/produits/le-bidon");

    expect(second.status()).toBe(200);
    expect(second.headers()["x-nextjs-cache"]).toBe("HIT");
  });

  for (const path of ["/fr/produits/fruite-vert", "/en/produits/fruite-noir"]) {
    test(`has no serious or critical accessibility violation on ${path}`, async ({ page }) => {
      await page.goto(path);
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
