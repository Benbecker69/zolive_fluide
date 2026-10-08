import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "olive-verte-2026";
const freshEmail = () =>
  `locked-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;

async function attempt(page: Page, email: string, password: string) {
  await page.goto("/fr/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test("locks sign-in after five failures, even with the right password", async ({ page }) => {
  const email = freshEmail();
  await page.goto("/fr/inscription");
  await page.getByLabel("Nom").fill("Camille Martin");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/fr$/);

  const alert = page.getByRole("main").getByRole("alert");
  for (let failure = 0; failure < 5; failure += 1) {
    await attempt(page, email, "mauvais-mot-de-passe");
    await expect(alert).toHaveText("Adresse e-mail ou mot de passe incorrect.");
  }

  await attempt(page, email, PASSWORD);
  await expect(alert).toHaveText("Trop de tentatives. Réessayez dans 15 minutes.");
  await expect(page).toHaveURL(/\/fr\/connexion$/);
});

test("locks an address without account in the same way", async ({ page }) => {
  const email = freshEmail();
  const alert = page.getByRole("main").getByRole("alert");

  for (let failure = 0; failure < 5; failure += 1) {
    await attempt(page, email, "mauvais-mot-de-passe");
    await expect(alert).toHaveText("Adresse e-mail ou mot de passe incorrect.");
  }

  await attempt(page, email, "mauvais-mot-de-passe");
  await expect(alert).toHaveText("Trop de tentatives. Réessayez dans 15 minutes.");
});
