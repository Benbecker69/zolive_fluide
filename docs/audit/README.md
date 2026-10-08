# Audit de cadrage

J'ai mené cet audit avant d'écrire la moindre ligne de code. Il répond à quatre questions, dans cet ordre : qu'est-ce que je construis, quelles exigences de qualité je dois tenir, avec quelles technologies, et quels risques je dois surveiller. Il se termine par le plan de l'audit que je mènerai sur le site livré.

| Document | Question traitée |
| --- | --- |
| [01 — Contexte et périmètre](01-contexte-et-perimetre.md) | Pour qui, pourquoi, quoi, et quoi pas |
| [02 — Exigences de qualité](02-exigences-qualite.md) | Performance, sécurité, accessibilité, maintenabilité, conformité, internationalisation, écoconception, exploitabilité : cibles mesurables |
| [03 — Étude technique](03-etude-technique.md) | Options comparées et choix de la pile technique |
| [04 — Registre des risques](04-risques.md) | Ce qui peut mal tourner et ce que j'ai prévu |
| [05 — Plan de l'audit final](05-plan-audit-final.md) | Comment je vérifierai chaque exigence sur le site livré |
| [Sources](sources.md) | Bibliographie datée, avec le niveau de vérification de chaque source |

## Synthèse

- **Produit.** Une boutique en ligne bilingue (français, anglais) : catalogue, panier, compte client, commande avec paiement simulé, historique des commandes. Catalogue fictif, exécution locale sous Docker, aucun paiement ni donnée réels.
- **Enjeu.** Je suis évalué d'abord sur ma démarche de lead développeur : la traçabilité de mes décisions et la preuve de la qualité comptent autant que le site.
- **Exigences structurantes.** Seuils « bon » des Core Web Vitals et score Lighthouse d'au moins 90 ; couverture des dix catégories de l'OWASP Top 10:2025 ; conformité WCAG 2.2 niveau AA ; architecture modulaire vérifiée par l'outillage.
- **Pile retenue.** Next.js 16 (App Router) et TypeScript sur Node.js 24 LTS, PostgreSQL avec Drizzle ORM, Better Auth, next-intl, Tailwind CSS 4, Vitest et Playwright, Docker Compose. Je justifie chaque choix face à ses alternatives dans l'étude technique et je le consigne dans un ADR (dossier `docs/adr/`).
- **Risques principaux.** L'historique de vulnérabilités critiques de l'écosystème React/Next.js, un ORM encore en version 0.x, et le fait que je travaille seul, sans relecteur tiers.

## Ma méthode

1. **Je pars du besoin, pas de l'outil.** Je pose les exigences avant l'étude technique, puis j'évalue les technologies contre elles.
2. **Une exigence = une cible + une mesure + une source.** Si je ne sais pas mesurer une exigence, je ne la retiens pas comme telle : je la reformule ou je la range dans les bonnes pratiques.
3. **Je privilégie les sources primaires.** Spécifications, textes officiels, documentation des éditeurs, registre npm. Les enquêtes d'usage me servent d'indice, jamais de preuve unique.
4. **Je croise.** J'appuie un choix structurant sur au moins deux sources indépendantes, ou sur une source et une vérification directe (commande, mesure).
5. **Je dis ce que je ne sais pas.** Quand je n'ai pas lu la source primaire, je l'écris en toutes lettres. Je n'affirme rien de mémoire.

Toutes mes consultations et mesures datent du **8 octobre 2026**. Les versions de logiciels citées sont celles du registre npm à cette date ; je les revérifierai au moment de l'installation.

## Point ouvert

Je n'ai pas encore la grille d'évaluation détaillée de la formation, et je n'ai pas trouvé en ligne la fiche du référentiel correspondant à mon mastère [S49]. J'aligne donc cet audit sur les compétences généralement attendues d'un lead développeur : cadrage, architecture, pilotage, qualité, sécurité, documentation. **Action : dès que j'ai la grille, je trace chaque critère vers le livrable qui y répond.**
