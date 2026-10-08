import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "olive-verte-2026";
const freshEmail = () =>
  `delete-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;

async function signUp(page: Page, email: string) {
  await page.goto("/fr/inscription");
  await page.getByLabel("Nom").fill("Camille Martin");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/fr\/compte$/);
}

const deletion = (page: Page) => page.getByRole("region", { name: "Supprimer mon compte" });

async function confirmDeletion(page: Page, password: string) {
  await deletion(page).getByLabel("Confirmez avec votre mot de passe").fill(password);
  await deletion(page).getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
}

test("states what is deleted and what is kept before asking for the password", async ({ page }) => {
  await signUp(page, freshEmail());

  await expect(
    deletion(page).getByText("La suppression est immédiate et définitive."),
  ).toBeVisible();
  await expect(deletion(page).getByRole("heading", { name: "Ce qui est supprimé" })).toBeVisible();
  await expect(deletion(page).getByRole("listitem")).toHaveText([
    "votre nom, votre adresse e-mail et votre mot de passe",
    "votre adresse de livraison",
    "vos sessions, sur tous vos appareils",
    "votre panier enregistré",
  ]);
  await expect(deletion(page).getByRole("heading", { name: "Ce qui est conservé" })).toBeVisible();
  await expect(deletion(page).getByText(/Les journaux de sécurité du site/)).toBeVisible();
});

test("deletes nothing without the right password", async ({ page }) => {
  await signUp(page, freshEmail());

  await confirmDeletion(page, "");
  await expect(
    deletion(page).getByText("Saisissez votre mot de passe pour confirmer la suppression."),
  ).toBeVisible();

  await confirmDeletion(page, "pas-le-bon-mot-de-passe");
  await expect(
    deletion(page).getByText("Mot de passe incorrect. Votre compte n'a pas été supprimé."),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Mon compte" })).toBeVisible();
});

test("deletes the account, ends the session and frees the e-mail address", async ({ page }) => {
  const email = freshEmail();
  await signUp(page, email);

  await confirmDeletion(page, PASSWORD);
  await expect(page).toHaveURL(/\/fr\/compte\/supprime$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Votre compte est supprimé" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);

  // The session is gone: the account page sends back to the sign-in page.
  await page.goto("/fr/compte");
  await expect(page).toHaveURL(/\/fr\/connexion\?next=\/compte$/);

  // The credentials no longer open anything.
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("main").getByText("Adresse e-mail ou mot de passe incorrect."),
  ).toBeVisible();

  // The address can be used for a new account.
  await signUp(page, email);
});

test("deletes the saved cart with the account", async ({ page }) => {
  await page.goto("/fr/produits/fruite-vert");
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Ajouté au panier." })).toBeVisible();
  await signUp(page, freshEmail());

  await confirmDeletion(page, PASSWORD);
  await expect(page).toHaveURL(/\/fr\/compte\/supprime$/);

  await page.goto("/fr/panier");
  await expect(page.getByText("Votre panier est vide.")).toBeVisible();
});

test("the confirmation page is not shown to someone who is signed in", async ({ page }) => {
  await signUp(page, freshEmail());

  await page.goto("/fr/compte/supprime");
  await expect(page).toHaveURL(/\/fr\/compte$/);
});
