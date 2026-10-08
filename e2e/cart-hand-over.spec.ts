import { expect, type Page, test } from "@playwright/test";

const PASSWORD = "olive-verte-2026";
const freshEmail = () => `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;

const cartLink = (page: Page) => page.getByRole("banner").getByRole("link", { name: /^Panier/ });

async function addToCart(page: Page, slug: string) {
  await page.goto(`/fr/produits/${slug}`);
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Ajouté au panier." })).toBeVisible();
}

async function signUp(page: Page, email: string) {
  await page.goto("/fr/inscription");
  await page.getByLabel("Nom").fill("Camille Martin");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/fr\/compte$/);
}

async function signIn(page: Page, email: string) {
  await page.goto("/fr/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/fr\/compte$/);
}

async function signOut(page: Page) {
  await page.goto("/fr/compte");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/fr$/);
}

test("keeps the cart filled as a guest when the visitor creates an account", async ({ page }) => {
  await addToCart(page, "fruite-vert");
  await signUp(page, freshEmail());

  await page.goto("/fr/panier");
  await expect(page.getByRole("heading", { level: 2, name: "Fruité vert" })).toBeVisible();
});

test("leaves the device without cart at sign-out and finds it again at sign-in", async ({
  page,
}) => {
  const email = freshEmail();
  await addToCart(page, "le-bidon");
  await signUp(page, email);

  await signOut(page);
  await page.goto("/fr/panier");
  await expect(page.getByText("Votre panier est vide.")).toBeVisible();
  await expect(cartLink(page)).toHaveAccessibleName("Panier, vide");

  await signIn(page, email);
  await page.goto("/fr/panier");
  await expect(page.getByRole("heading", { level: 2, name: "Le bidon" })).toBeVisible();
});

test("adds up the guest cart and the account cart at sign-in", async ({ browser, page }) => {
  const email = freshEmail();
  await addToCart(page, "fruite-vert");
  await signUp(page, email);

  // Another device: the same customer fills a cart before signing in.
  const elsewhere = await (await browser.newContext()).newPage();
  const at = (path: string) => new URL(path, page.url()).toString();
  await elsewhere.goto(at("/fr/produits/fruite-vert"));
  await elsewhere.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(
    elsewhere.getByRole("status").filter({ hasText: "Ajouté au panier." }),
  ).toBeVisible();
  await elsewhere.goto(at("/fr/produits/tapenade-noire"));
  await elsewhere.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(
    elsewhere.getByRole("status").filter({ hasText: "Ajouté au panier." }),
  ).toBeVisible();

  await elsewhere.goto(at("/fr/connexion"));
  await elsewhere.getByLabel("Adresse e-mail").fill(email);
  await elsewhere.getByLabel("Mot de passe").fill(PASSWORD);
  await elsewhere.getByRole("button", { name: "Se connecter" }).click();
  await expect(elsewhere).toHaveURL(/\/fr\/compte$/);

  await elsewhere.goto(at("/fr/panier"));
  const summary = elsewhere.getByRole("region", { name: "Récapitulatif" });
  await expect(summary).toContainText("3 articles");
  await expect(summary).toContainText("57 €");
  await elsewhere.context().close();
});
