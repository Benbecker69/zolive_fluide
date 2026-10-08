import { TextLink } from "@/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-page flex-col items-start gap-4 px-5 py-24 sm:px-8 lg:px-12">
      <h1 className="text-6xl">Zolive</h1>
      <p className="text-muted">Boutique en construction.</p>
      <TextLink href="/styleguide">Voir la charte graphique</TextLink>
    </main>
  );
}
