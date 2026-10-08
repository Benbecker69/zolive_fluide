# Zolive

Boutique en ligne d'huiles d'olive et d'épicerie fine. Projet réalisé dans le cadre de mon mastère Lead Développeur (EEMI) ; la marque et le catalogue sont fictifs.

Ce dépôt contient le site et la démarche qui l'encadre : audit de cadrage, décisions d'architecture justifiées, plan de projet agile et guides de méthode.

![Page d'accueil de la maquette](design/screenshots/accueil.png)

## État du projet

**Sprint 1 en cours.** Le cadrage est terminé et validé : voir la [revue et la rétrospective du sprint 0](docs/project/sprints/sprint-0.md).

| Sprint | Objectif | État |
| --- | --- | --- |
| 0 — Cadrage | Savoir quoi construire, comment, et comment le prouver | Terminé |
| 1 — Fondations et catalogue | Un visiteur parcourt le catalogue en français et en anglais | En cours |
| 2 — Panier et comptes | Un client remplit un panier et possède un compte | À venir |
| 3 — Commande | Un client passe commande et la retrouve dans son historique | À venir |
| 4 — Durcissement et audit | Le site tient ses exigences, et je le prouve | À venir |

Suivi : [issues](https://github.com/Benbecker69/zolive_fluide/issues), [jalons](https://github.com/Benbecker69/zolive_fluide/milestones) et tableau du projet.

## Ce que je construis

Une boutique bilingue (français, anglais) : catalogue, panier, compte client, commande avec paiement simulé, historique des commandes. Le site s'exécute en local avec Docker ; il ne traite ni paiement ni donnée réels.

## Pile technique

Next.js 16 (App Router), React 19 et TypeScript 6 sur Node.js 24 LTS ; PostgreSQL 18 avec Drizzle ORM ; Better Auth ; next-intl ; Tailwind CSS 4 ; Vitest et Playwright ; Docker Compose.

Chaque choix est comparé à ses alternatives dans l'[étude technique](docs/audit/03-etude-technique.md) et consigné dans un [ADR](docs/adr/README.md).

## Lire la documentation

| Document | Contenu |
| --- | --- |
| [Audit de cadrage](docs/audit/README.md) | Périmètre, exigences mesurables (performance, sécurité, accessibilité, maintenabilité…), étude technique, risques, plan de l'audit final, sources |
| [Décisions d'architecture](docs/adr/README.md) | Dix ADR : contexte, options, décision, conséquences |
| [Plan de projet](docs/project/plan-de-projet.md) | Organisation agile, feuille de route, *Definition of Ready* et *Done* |
| [Architecture cible](docs/project/architecture.md) | Diagrammes C4, couches, modèle de données, parcours de commande |
| [Backlog](docs/project/backlog.md) | Les issues par sprint, avec priorité et estimation |
| [Guides de méthode](docs/playbooks/README.md) | Ma façon de mener un projet et d'instruire un sujet technique, avec les listes de contrôle |
| [Maquette](design/README.md) | Pages de la maquette, jetons de design, contrastes |
| [Contribuer](CONTRIBUTING.md) | Flux de travail, convention de commits, relecture |

Index complet : [`docs/README.md`](docs/README.md).

## Lancer le site

Prérequis : Node.js 24 (la version est déclarée dans `.node-version`) et pnpm 11.

```bash
pnpm install
pnpm dev
```

Le site répond sur `http://localhost:3000`. Pour l'instant, il n'affiche qu'une page d'attente : les pages du catalogue arrivent au fil du sprint 1. La maquette se consulte en ouvrant les fichiers de [`design/mockup/`](design/mockup/) dans un navigateur.

### Commandes

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | Serveur de développement |
| `pnpm build` puis `pnpm start` | Build et serveur de production |
| `pnpm lint` | Analyse statique, dont la règle de dépendances entre couches |
| `pnpm typecheck` | Vérification des types en mode strict |
| `pnpm test` | Tests unitaires et tests de l'outillage |
| `pnpm format` / `pnpm format:check` | Mise en forme du code |
| `pnpm check` | Tout ce que la CI vérifie, dans l'ordre |

### Organisation du code

Le code vit dans `src/`, découpé en cinq couches dont les dépendances ne vont que dans un sens : `app` → `features` → `data`, avec `ui` et `lib` en appui. La règle est décrite dans l'[ADR 0002](docs/adr/0002-nextjs-modular-monolith.md) et vérifiée par le linter : une importation qui la viole fait échouer `pnpm lint`.
