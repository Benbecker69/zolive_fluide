# Backlog produit

Le backlog vit dans les [issues GitHub](https://github.com/Benbecker69/zolive_fluide/issues) : c'est là que je le fais évoluer. Cette page en est la photographie au 8 octobre 2026, à la clôture du cadrage ; elle me sert de vue d'ensemble et de point de comparaison pour mesurer ce qui aura changé en cours de route.

Chaque issue porte une *user story* ou un contexte, des critères d'acceptation testables, les exigences de l'[audit](../audit/02-exigences-qualite.md) qu'elle touche, une priorité MoSCoW et une estimation en points. Les règles de priorisation et d'estimation sont décrites dans le [plan de projet](plan-de-projet.md).

## Vue d'ensemble

| Sprint | Issues | Points *Must* | Points *Should* | Points *Could* | Total |
| --- | --- | --- | --- | --- | --- |
| Sprint 1 — Fondations et catalogue | 9 | 35 | 0 | 0 | 35 |
| Sprint 2 — Panier et comptes | 6 | 24 | 6 | 0 | 30 |
| Sprint 3 — Commande | 5 | 29 | 0 | 0 | 29 |
| Sprint 4 — Durcissement et audit final | 9 | 23 | 3 | 7 | 33 |
| **Total** | **29** | **111** | **9** | **7** | **127** |

Le sprint 0 (cadrage) n'est pas estimé en points : ses six issues sont des livrables documentaires, suivis dans le jalon *Sprint 0 — Scoping*.

## Sprint 1 — Fondations et catalogue

**Objectif de sprint.** Un visiteur parcourt le catalogue en français et en anglais.

| Issue | Intitulé | Domaine | Priorité | Points |
| --- | --- | --- | --- | --- |
| [#12](https://github.com/Benbecker69/zolive_fluide/issues/12) | chore(tooling): scaffold the Next.js app with strict TypeScript, lint and formatting | infra | Must | 3 |
| [#13](https://github.com/Benbecker69/zolive_fluide/issues/13) | chore(infra): run the app and PostgreSQL with Docker Compose and validate configuration at start-up | infra | Must | 3 |
| [#14](https://github.com/Benbecker69/zolive_fluide/issues/14) | ci: add the application pipeline with lint, types, tests, build and security scans | infra, security | Must | 3 |
| [#15](https://github.com/Benbecker69/zolive_fluide/issues/15) | feat(ui): implement the design tokens and the base components of the style guide | design-system, a11y | Must | 5 |
| [#16](https://github.com/Benbecker69/zolive_fluide/issues/16) | feat(i18n): serve every page under a locale prefix and add a language switcher | i18n | Must | 3 |
| [#17](https://github.com/Benbecker69/zolive_fluide/issues/17) | feat(catalogue): model the catalogue in the database and seed the demo data | catalogue | Must | 3 |
| [#18](https://github.com/Benbecker69/zolive_fluide/issues/18) | feat(catalogue): build the home page | catalogue, perf | Must | 5 |
| [#19](https://github.com/Benbecker69/zolive_fluide/issues/19) | feat(catalogue): build the shop listing with category filter and sorting | catalogue | Must | 5 |
| [#20](https://github.com/Benbecker69/zolive_fluide/issues/20) | feat(catalogue): build the product page with format and quantity selection | catalogue | Must | 5 |

## Sprint 2 — Panier et comptes

**Objectif de sprint.** Un client remplit un panier et possède un compte.

| Issue | Intitulé | Domaine | Priorité | Points |
| --- | --- | --- | --- | --- |
| [#21](https://github.com/Benbecker69/zolive_fluide/issues/21) | feat(cart): add, update and remove items in a persistent cart | cart | Must | 8 |
| [#22](https://github.com/Benbecker69/zolive_fluide/issues/22) | feat(account): sign up, sign in and sign out with email and password | account, security | Must | 8 |
| [#23](https://github.com/Benbecker69/zolive_fluide/issues/23) | feat(account): throttle authentication attempts and log security events | account, security | Must | 3 |
| [#24](https://github.com/Benbecker69/zolive_fluide/issues/24) | feat(account): view and edit my profile and delivery address | account | Must | 5 |
| [#25](https://github.com/Benbecker69/zolive_fluide/issues/25) | feat(cart): merge the guest cart into the account cart at sign-in | cart | Should | 3 |
| [#26](https://github.com/Benbecker69/zolive_fluide/issues/26) | feat(account): delete my account and personal data | account, legal | Should | 3 |

## Sprint 3 — Commande

**Objectif de sprint.** Un client passe commande et la retrouve dans son historique.

| Issue | Intitulé | Domaine | Priorité | Points |
| --- | --- | --- | --- | --- |
| [#27](https://github.com/Benbecker69/zolive_fluide/issues/27) | feat(checkout): go through address, review and confirmation steps | checkout | Must | 8 |
| [#28](https://github.com/Benbecker69/zolive_fluide/issues/28) | feat(checkout): pay through a simulated provider with success, refusal and error scenarios | checkout | Must | 5 |
| [#29](https://github.com/Benbecker69/zolive_fluide/issues/29) | feat(checkout): create the order atomically with stock check and server-side totals | checkout, security | Must | 8 |
| [#30](https://github.com/Benbecker69/zolive_fluide/issues/30) | feat(account): list my orders and open the detail of one | account, security | Must | 5 |
| [#31](https://github.com/Benbecker69/zolive_fluide/issues/31) | feat(legal): publish legal notice, terms of sale, privacy and cookie pages | legal | Must | 3 |

## Sprint 4 — Durcissement et audit final

**Objectif de sprint.** Le site tient ses exigences, et je le prouve.

| Issue | Intitulé | Domaine | Priorité | Points |
| --- | --- | --- | --- | --- |
| [#32](https://github.com/Benbecker69/zolive_fluide/issues/32) | feat(security): send security headers and a content security policy | security | Must | 5 |
| [#33](https://github.com/Benbecker69/zolive_fluide/issues/33) | test(e2e): cover the three key journeys in both languages with accessibility checks | a11y | Must | 5 |
| [#34](https://github.com/Benbecker69/zolive_fluide/issues/34) | perf: enforce a performance budget with Lighthouse CI | perf | Must | 3 |
| [#35](https://github.com/Benbecker69/zolive_fluide/issues/35) | feat(seo): add metadata, hreflang, sitemap and product structured data | catalogue, i18n | Should | 3 |
| [#36](https://github.com/Benbecker69/zolive_fluide/issues/36) | feat(ops): add structured logging, neutral error pages and correlation identifiers | infra, security | Must | 3 |
| [#37](https://github.com/Benbecker69/zolive_fluide/issues/37) | docs(audit): run the final quality audit and publish the report | process | Must | 5 |
| [#38](https://github.com/Benbecker69/zolive_fluide/issues/38) | chore(release): write the runbook, update the changelog and tag v1.0.0 | process | Must | 2 |
| [#39](https://github.com/Benbecker69/zolive_fluide/issues/39) | feat(newsletter): subscribe to the newsletter from the home page | catalogue, legal | Could | 2 |
| [#40](https://github.com/Benbecker69/zolive_fluide/issues/40) | feat(catalogue): search the catalogue by product name | catalogue | Could | 5 |

## Ce que je ferai évoluer

- **Les estimations** : elles sont comparatives et faites avant le premier sprint. Je les réviserai avec la vélocité mesurée.
- **Le découpage** : une story qui se révèle trop grosse en cours de route est découpée en nouvelles issues, et l'issue d'origine le mentionne.
- **Les priorités** : un *Should* peut devenir *Must* si la revue de sprint le justifie ; la décision est écrite dans l'issue.
