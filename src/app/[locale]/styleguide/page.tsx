import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button, ButtonLink, TextLink } from "@/ui/button";
import { FilterChip, Tag } from "@/ui/chip";
import { ProductCard } from "@/ui/product-card";
import { QuantityStepper } from "@/ui/quantity-stepper";
import { CartLink } from "@/ui/site-chrome";
import { TextField } from "@/ui/text-field";

// Static page without data: generated at build time, in French only.
export function generateStaticParams() {
  return [{ locale: "fr" }];
}

export const metadata: Metadata = {
  title: "Charte graphique — Zolive",
  robots: { index: false },
};

const swatches = [
  { name: "Fond", token: "ground", className: "bg-ground text-ink border border-line" },
  { name: "Encre", token: "ink", className: "bg-ink text-ground" },
  { name: "Vert bouteille", token: "brand", className: "bg-brand text-ground" },
  { name: "Citron", token: "accent", className: "bg-accent text-ink" },
  { name: "Sauge", token: "tint-sage", className: "bg-tint-sage text-ink" },
  { name: "Zeste", token: "tint-zest", className: "bg-tint-zest text-ink" },
  { name: "Ciel", token: "tint-sky", className: "bg-tint-sky text-ink" },
  { name: "Pêche", token: "tint-peach", className: "bg-tint-peach text-ink" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-line pt-10">
      <h2 className="text-3xl">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Living version of the style guide: every component of `ui/` on one page.
 * It is the page the accessibility checks run against.
 */
export default async function StyleguidePage({ params }: PageProps<"/[locale]/styleguide">) {
  // Developer page, written in French only: it does not exist in other languages.
  const { locale } = await params;
  if (locale !== "fr") notFound();
  setRequestLocale(locale);

  return (
    <>
      <div className="mx-auto flex max-w-page flex-col gap-16 px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] leading-none tracking-[-0.045em]">
            Charte <em>graphique</em>
          </h1>
          <p className="max-w-[46ch] text-lg text-muted">
            Les composants de l&apos;interface, tels qu&apos;ils sont utilisés dans les pages.
          </p>
        </div>

        <Section title="Couleurs">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map((swatch) => (
              <li
                key={swatch.token}
                className={`flex h-32 flex-col justify-end rounded-card p-5 ${swatch.className}`}
              >
                <span className="font-display text-xl font-medium">{swatch.name}</span>
                <span className="text-sm">{swatch.token}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typographie">
          <div className="grid gap-8 md:grid-cols-3">
            <p className="font-display text-4xl leading-tight font-medium tracking-[-0.035em]">
              Tout pour une bonne table.
            </p>
            <p className="font-serif text-4xl leading-tight italic">tout simplement</p>
            <p className="text-muted">
              Des huiles pressées à froid, des olives cueillies à maturité et quelques bonnes choses
              à poser sur la table.
            </p>
          </div>
        </Section>

        <Section title="Boutons et liens">
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/styleguide" withArrow>
              Découvrir la boutique
            </ButtonLink>
            <Button variant="accent">Ajouter au panier</Button>
            <Button variant="outline">Visiter le moulin</Button>
            <Button variant="outline" disabled>
              Indisponible
            </Button>
            <TextLink href="/styleguide">Notre savoir-faire</TextLink>
          </div>
        </Section>

        <Section title="Navigation">
          <div className="flex">
            <CartLink href="/styleguide" label="Panier" count={2} />
          </div>
        </Section>

        <Section title="Filtres et étiquettes">
          <ul aria-label="Filtrer par rayon" className="flex flex-wrap items-center gap-2">
            <li>
              <FilterChip href="/styleguide" selected>
                Tout
              </FilterChip>
            </li>
            <li>
              <FilterChip href="/styleguide">Huiles d&apos;olive</FilterChip>
            </li>
            <li>
              <FilterChip href="/styleguide">Olives et tapenades</FilterChip>
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>Nouvelle récolte</Tag>
            <Tag tone="sage">Fruité vert</Tag>
            <Tag tone="accent">Édition limitée</Tag>
          </div>
        </Section>

        <Section title="Formulaires">
          <div className="grid max-w-3xl gap-8 md:grid-cols-2">
            <TextField
              label="Votre adresse e-mail"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="prenom@exemple.fr"
              hint="Une lettre par mois, pas plus."
            />
            <TextField
              label="Mot de passe"
              type="password"
              name="password"
              autoComplete="new-password"
              error="Le mot de passe doit contenir au moins 12 caractères."
            />
          </div>
          <QuantityStepper
            name="quantity"
            max={12}
            labels={{
              group: "Quantité",
              decrease: "Diminuer la quantité",
              increase: "Augmenter la quantité",
            }}
          />
        </Section>

        <Section title="Cartes produit">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProductCard
              href="/styleguide"
              name="Fruité vert"
              detail="Picholine · 50 cl"
              price="24 €"
              tint="sage"
              tag="Nouvelle récolte"
              packshot={{ kind: "bottle", label: "fruité vert", detail: "50 CL" }}
            />
            <ProductCard
              href="/styleguide"
              name="Le bidon"
              detail="Fruité mûr · 1 L"
              price="36 €"
              tint="sky"
              packshot={{ kind: "tin", label: "fruité mûr", detail: "1 LITRE" }}
            />
            <ProductCard
              href="/styleguide"
              name="Tapenade noire"
              detail="Olives de Nyons · 180 g"
              price="9 €"
              tint="peach"
              packshot={{ kind: "jar-dark", label: "tapenade noire" }}
            />
            <ProductCard
              href="/styleguide"
              name="Le coffret découverte"
              detail="Trois fruités · 3 × 25 cl"
              price="39 €"
              tint="zest"
              packshot={{ kind: "box", label: "le coffret" }}
            />
          </div>
        </Section>
      </div>
    </>
  );
}
