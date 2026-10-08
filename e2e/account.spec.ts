import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "olive-verte-2026";

/** A fresh e-mail for each test: the database is shared by the whole run. */
const freshEmail = () =>
  `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;

async function signUp(page: Page, email: string, name = "Camille Martin") {
  await page.goto("/fr/inscription");
  await page.getByLabel("Nom").fill(name);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/fr\/compte$/);
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/fr/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe("signing up", () => {
  test("creates the account, signs in and greets the customer", async ({ page }) => {
    const email = freshEmail();
    await signUp(page, email);

    await expect(page.getByRole("heading", { level: 1, name: "Mon compte" })).toBeVisible();
    await expect(page.getByText("Bonjour Camille Martin.")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("keeps the session in a protected cookie", async ({ context, page }) => {
    await signUp(page, freshEmail());

    const cookie = (await context.cookies()).find((item) => item.name.endsWith("session_token"));
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax" });
    expect(await page.evaluate(() => document.cookie)).not.toContain("session_token");
  });

  test("refuses a short password, explains the rule and keeps the other fields", async ({
    page,
  }) => {
    const email = freshEmail();
    await page.goto("/fr/inscription");
    await page.getByLabel("Nom").fill("Camille Martin");
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill("trop-court");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    const password = page.getByLabel("Mot de passe");
    await expect(password).toHaveAttribute("aria-invalid", "true");
    await expect(password).toHaveAccessibleDescription(/au moins 12 caractères/);
    await expect(page).toHaveURL(/\/fr\/inscription$/);
    await expect(page.getByLabel("Nom")).toHaveValue("Camille Martin");
    await expect(page.getByLabel("Adresse e-mail")).toHaveValue(email);
    await expect(password).toHaveValue("");
  });

  test("marks every invalid field at once", async ({ page }) => {
    await page.goto("/fr/inscription");
    await page.getByLabel("Adresse e-mail").fill("pas-une-adresse");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    for (const label of ["Nom", "Adresse e-mail", "Mot de passe"]) {
      await expect(page.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
    }
  });

  test("says so when the e-mail already has an account", async ({ browser, page }) => {
    const email = freshEmail();
    await signUp(page, email);

    const other = await (await browser.newContext()).newPage();
    await other.goto(new URL("/fr/inscription", page.url()).toString());
    await other.getByLabel("Nom").fill("Quelqu'un d'autre");
    await other.getByLabel("Adresse e-mail").fill(email);
    await other.getByLabel("Mot de passe").fill(PASSWORD);
    await other.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(other.getByRole("main").getByRole("alert")).toContainText("Un compte existe déjà");
    await other.context().close();
  });
});

test.describe("signing in and out", () => {
  test("gives the same message for a wrong password and for an unknown e-mail", async ({
    page,
  }) => {
    const email = freshEmail();
    await signUp(page, email);
    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await signIn(page, email, "mauvais-mot-de-passe");
    const message = "Adresse e-mail ou mot de passe incorrect.";
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(message);
    await expect(page.getByLabel("Adresse e-mail")).toHaveValue(email);

    await signIn(page, freshEmail());
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(message);
  });

  test("signs in, then revokes the session on sign-out", async ({ context, page }) => {
    const email = freshEmail();
    await signUp(page, email);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/fr$/);

    await signIn(page, email);
    await expect(page).toHaveURL(/\/fr\/compte$/);
    const stolen = await context.cookies();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/fr$/);

    // Replaying the cookies captured before sign-out must not open the account again.
    await context.addCookies(stolen);
    await page.goto("/fr/compte");
    await expect(page).toHaveURL(/\/fr\/connexion\?next=\/compte$/);
  });

  test("sends a visitor without a session to the sign-in page", async ({ page }) => {
    await page.goto("/fr/compte");
    await expect(page).toHaveURL(/\/fr\/connexion\?next=\/compte$/);
    await expect(page.getByRole("heading", { level: 1, name: "Connexion" })).toBeVisible();
  });

  test("sends a signed-in customer away from the sign-in and sign-up pages", async ({ page }) => {
    await signUp(page, freshEmail());

    await page.goto("/fr/connexion");
    await expect(page).toHaveURL(/\/fr\/compte$/);
    await page.goto("/fr/inscription");
    await expect(page).toHaveURL(/\/fr\/compte$/);
  });

  test("is reachable from the header", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("banner").getByRole("link", { name: "Compte" }).click();
    await expect(page).toHaveURL(/\/fr\/connexion\?next=\/compte$/);
  });
});

test.describe("in English", () => {
  test("signs up and stays on the English site", async ({ page }) => {
    await page.goto("/en/inscription");
    await page.getByLabel("Name").fill("Sam Taylor");
    await page.getByLabel("Email address").fill(freshEmail());
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create my account" }).click();

    await expect(page).toHaveURL(/\/en\/compte$/);
    await expect(page.getByText("Hello Sam Taylor.")).toBeVisible();
  });
});

for (const path of ["/fr/connexion", "/fr/inscription", "/en/connexion", "/en/inscription"]) {
  test(`${path} has no serious or critical accessibility violation`, async ({ page }) => {
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
