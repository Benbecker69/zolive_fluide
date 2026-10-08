import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("language routing", () => {
  test.describe("for a French-speaking browser", () => {
    test.use({ locale: "fr-FR" });

    test("the root redirects to the French site", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/fr$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    });
  });

  test.describe("for an English-speaking browser", () => {
    test.use({ locale: "en-GB" });

    test("the root redirects to the English site", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });

  test.describe("for a browser in an unsupported language", () => {
    test.use({ locale: "de-DE" });

    test("the root falls back to French, the default language", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/fr$/);
    });
  });
});

test.describe("language switcher", () => {
  test("leads to the same page in the other language and back", async ({ page }) => {
    await page.goto("/fr");
    const switcher = page.getByRole("navigation", { name: "Langue" });
    await expect(switcher.getByRole("link", { name: "Français" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    await switcher.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Shop under construction.")).toBeVisible();

    await page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "Français" })
      .click();
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.getByText("Boutique en construction.")).toBeVisible();
  });

  test("each language declares its alternate versions", async ({ request }) => {
    const response = await request.get("/fr");
    const link = response.headers()["link"] ?? "";
    expect(link).toContain('hreflang="fr"');
    expect(link).toContain('hreflang="en"');
  });
});

test.describe("unknown page", () => {
  test("shows the localized not-found page with a 404 status", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("skip link", () => {
  test("is the first stop of the keyboard and jumps to the content", async ({ page }) => {
    await page.goto("/fr");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/);
  });
});

for (const locale of ["fr", "en"]) {
  test(`the ${locale} home page has no serious or critical accessibility violation`, async ({
    page,
  }) => {
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
