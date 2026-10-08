import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("style guide", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/styleguide");
  });

  test("has no serious or critical accessibility violation", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });

  test("every control is reachable with the keyboard and shows its focus", async ({ page }) => {
    const controls = page.locator("a[href], button:not([disabled]), input:not([type=hidden])");
    const expected = await controls.count();
    expect(expected).toBeGreaterThan(10);

    const reached = new Set<string>();
    for (let step = 0; step < expected; step += 1) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
      // The focus indicator of the theme is an outline: it must be drawn.
      await expect(focused).not.toHaveCSS("outline-style", "none");
      reached.add(await focused.evaluate((element) => element.outerHTML));
    }
    expect(reached.size).toBe(expected);
  });

  test("the quantity stepper stays inside its range", async ({ page }) => {
    const group = page.getByRole("group", { name: "Quantité" });
    const decrease = group.getByRole("button", { name: "Diminuer la quantité" });
    const increase = group.getByRole("button", { name: "Augmenter la quantité" });

    await expect(group.getByRole("status")).toHaveText("1");
    await expect(decrease).toBeDisabled();

    await increase.click();
    await increase.click();
    await expect(group.getByRole("status")).toHaveText("3");

    await decrease.click();
    await expect(group.getByRole("status")).toHaveText("2");
  });

  test("loads nothing from a third-party domain", async ({ page }) => {
    const origins = new Set<string>();
    page.on("request", (request) => origins.add(new URL(request.url()).origin));
    await page.reload({ waitUntil: "networkidle" });

    expect([...origins]).toEqual([new URL(page.url()).origin]);
  });
});
