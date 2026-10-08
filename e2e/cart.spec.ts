import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const cartLink = (page: Page) => page.getByRole("banner").getByRole("link", { name: /^Panier/ });

/** Adds the default format of a product from its page and waits for the confirmation. */
async function addFromProductPage(page: Page, slug: string) {
  await page.goto(`/fr/produits/${slug}`);
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Ajouté au panier." })).toBeVisible();
}

test.describe("cart", () => {
  test("is empty for a new visitor", async ({ page }) => {
    await page.goto("/fr/panier");

    await expect(page.getByRole("heading", { level: 1, name: "Panier" })).toBeVisible();
    await expect(page.getByText("Votre panier est vide.")).toBeVisible();
    await expect(cartLink(page)).toHaveAccessibleName("Panier, vide");
  });

  test("receives a product, confirms it and updates the header count", async ({ page }) => {
    await addFromProductPage(page, "fruite-vert");

    await expect(cartLink(page)).toHaveAccessibleName("Panier, 1 article");
    await page.getByRole("link", { name: "Voir le panier" }).click();

    await expect(page).toHaveURL(/\/fr\/panier$/);
    await expect(page.getByRole("heading", { level: 2, name: "Fruité vert" })).toBeVisible();
    await expect(page.getByText("50 cl · 24 € l'unité")).toBeVisible();
    await expect(page.getByRole("region", { name: "Récapitulatif" })).toContainText("1 article");
    await expect(page.getByRole("region", { name: "Récapitulatif" })).toContainText("24 €");
  });

  test("adds the chosen format and quantity", async ({ page }) => {
    await page.goto("/fr/produits/fruite-vert");
    await page.getByRole("radio", { name: "75 cl" }).check();
    await page.getByRole("button", { name: "Augmenter la quantité" }).click();
    await page.getByRole("button", { name: "Ajouter au panier 66 €" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "2 exemplaires ajoutés" }),
    ).toBeVisible();

    await page.goto("/fr/panier");
    await expect(page.getByText("75 cl · 33 € l'unité")).toBeVisible();
    await expect(page.getByRole("region", { name: "Récapitulatif" })).toContainText("66 €");
  });

  test("updates the totals when a quantity changes and when a line is removed", async ({
    page,
  }) => {
    await addFromProductPage(page, "fruite-vert");
    await addFromProductPage(page, "tapenade-noire");
    await page.goto("/fr/panier");

    const summary = page.getByRole("region", { name: "Récapitulatif" });
    await expect(summary).toContainText("2 articles");
    await expect(summary).toContainText("33 €");

    await page
      .getByRole("group", { name: "Quantité de Fruité vert, 50 cl" })
      .getByRole("button", { name: "Augmenter la quantité" })
      .click();
    await expect(summary).toContainText("3 articles");
    await expect(summary).toContainText("57 €");
    await expect(cartLink(page)).toHaveAccessibleName("Panier, 3 articles");

    await page.getByRole("button", { name: "Retirer Tapenade noire, 180 g du panier" }).click();
    await expect(summary).toContainText("2 articles");
    await expect(summary).toContainText("48 €");
    await expect(page.getByRole("heading", { level: 2, name: "Tapenade noire" })).toHaveCount(0);
  });

  test("shows the empty state again once the last line is removed", async ({ page }) => {
    await addFromProductPage(page, "le-bidon");
    await page.goto("/fr/panier");
    await page.getByRole("button", { name: "Retirer Le bidon, 1 L du panier" }).click();

    await expect(page.getByText("Votre panier est vide.")).toBeVisible();
  });

  test("survives closing the page and coming back", async ({ context, page }) => {
    await addFromProductPage(page, "fruite-mur");
    await page.close();

    const later = await context.newPage();
    await later.goto("/fr/panier");
    await expect(later.getByRole("heading", { level: 2, name: "Fruité mûr" })).toBeVisible();
  });

  test("stores nothing but an opaque identifier in a protected cookie", async ({
    context,
    page,
  }) => {
    await addFromProductPage(page, "fruite-vert");

    const cookie = (await context.cookies()).find((item) => item.name === "zolive_cart");
    expect(cookie?.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax" });
    // The identifier is not readable from scripts running in the page.
    expect(await page.evaluate(() => document.cookie)).not.toContain("zolive_cart");
  });

  test("keeps the cart of one visitor away from another", async ({ browser, page }) => {
    await addFromProductPage(page, "fruite-vert");

    const stranger = await browser.newContext();
    const other = await stranger.newPage();
    await other.goto(new URL("/fr/panier", page.url()).toString());
    await expect(other.getByText("Votre panier est vide.")).toBeVisible();
    await stranger.close();
  });

  test("is in English on the English site", async ({ page }) => {
    await page.goto("/en/produits/fruite-vert");
    await page.getByRole("button", { name: /^Add to cart/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "Added to cart." })).toBeVisible();

    await page.goto("/en/panier");
    await expect(page.getByRole("heading", { level: 1, name: "Cart" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Green fruity" })).toBeVisible();
    await expect(page.getByText("50 cl · €24.00 each")).toBeVisible();
  });

  for (const locale of ["fr", "en"]) {
    test(`has no serious or critical accessibility violation in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/produits/fruite-vert`);
      await page.getByRole("button", { name: /^(Ajouter au panier|Add to cart)/ }).click();
      await expect(page.getByRole("status").filter({ hasText: /panier|cart/ })).toBeVisible();
      await page.goto(`/${locale}/panier`);

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
