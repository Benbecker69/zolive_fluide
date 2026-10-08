import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "olive-verte-2026";
const freshEmail = () =>
  `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;

async function signUp(page: Page, email: string, name = "Camille Martin") {
  await page.goto("/fr/inscription");
  await page.getByLabel("Nom").fill(name);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/fr\/compte$/);
}

async function fillAddress(page: Page, postalCode = "13100") {
  await page.getByLabel("Numéro et rue").fill("12 rue des Oliviers");
  await page.getByLabel("Code postal").fill(postalCode);
  await page.getByLabel("Ville").fill("Aix-en-Provence");
  await page.getByRole("button", { name: "Enregistrer l'adresse" }).click();
}

test.describe("returning to the page asked for", () => {
  test("signs in, then brings the visitor back to the account", async ({ page }) => {
    const email = freshEmail();
    await signUp(page, email);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/fr$/);

    await page.goto("/fr/compte");
    await expect(page).toHaveURL(/\/fr\/connexion\?next=\/compte$/);

    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/fr\/compte$/);
  });

  test("never follows a return address that leaves the site", async ({ page }) => {
    const email = freshEmail();
    await signUp(page, email);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/fr$/);

    await page.goto("/fr/connexion?next=https://example.com/piege");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/fr\/compte$/);
  });
});

test.describe("profile", () => {
  test("changes the name and keeps it", async ({ page }) => {
    await signUp(page, freshEmail());

    await page.getByLabel("Nom").fill("Camille Durand");
    await page.getByRole("button", { name: "Enregistrer le nom" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Nom enregistré." })).toBeVisible();

    await page.reload();
    await expect(page.getByText("Bonjour Camille Durand.")).toBeVisible();
    await expect(page.getByLabel("Nom")).toHaveValue("Camille Durand");
  });

  test("refuses an empty name and says why", async ({ page }) => {
    await signUp(page, freshEmail());

    await page.getByLabel("Nom").fill("   ");
    await page.getByRole("button", { name: "Enregistrer le nom" }).click();

    await expect(page.getByLabel("Nom")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nom")).toHaveAccessibleDescription("Indiquez votre nom.");
  });

  test("saves the delivery address and shows it again", async ({ page }) => {
    await signUp(page, freshEmail());
    await expect(page.getByLabel("Destinataire")).toHaveValue("Camille Martin");

    await fillAddress(page);
    await expect(
      page.getByRole("status").filter({ hasText: "Adresse enregistrée." }),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Numéro et rue")).toHaveValue("12 rue des Oliviers");
    await expect(page.getByLabel("Code postal")).toHaveValue("13100");
    await expect(page.getByLabel("Ville")).toHaveValue("Aix-en-Provence");
  });

  test("refuses a wrong postal code, explains it and keeps what was typed", async ({ page }) => {
    await signUp(page, freshEmail());
    await fillAddress(page, "1310");

    const postalCode = page.getByLabel("Code postal");
    await expect(postalCode).toHaveAttribute("aria-invalid", "true");
    await expect(postalCode).toHaveAccessibleDescription(/cinq chiffres/);
    await expect(postalCode).toHaveValue("1310");
    await expect(page.getByLabel("Numéro et rue")).toHaveValue("12 rue des Oliviers");
  });

  test("keeps one customer's address away from another", async ({ browser, page }) => {
    await signUp(page, freshEmail());
    await fillAddress(page);
    await expect(
      page.getByRole("status").filter({ hasText: "Adresse enregistrée." }),
    ).toBeVisible();

    const other = await (await browser.newContext()).newPage();
    await other.goto(new URL("/fr/inscription", page.url()).toString());
    await other.getByLabel("Nom").fill("Sam Taylor");
    await other.getByLabel("Adresse e-mail").fill(freshEmail());
    await other.getByLabel("Mot de passe").fill(PASSWORD);
    await other.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(other.getByLabel("Destinataire")).toHaveValue("Sam Taylor");
    await expect(other.getByLabel("Numéro et rue")).toHaveValue("");
    await other.context().close();
  });

  for (const locale of ["fr", "en"]) {
    test(`has no serious or critical accessibility violation in ${locale}`, async ({ page }) => {
      await signUp(page, freshEmail());
      await page.goto(`/${locale}/compte`);

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
