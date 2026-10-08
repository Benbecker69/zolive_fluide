# Décisions d'architecture

Je consigne ici chaque décision structurante du projet sous la forme d'un ADR (*Architectural Decision Record*) : un document court qui capture une décision et sa justification. L'ensemble forme le journal de décisions du projet.

## Règles que je m'impose

- **Une décision par document**, au format [MADR 4.0.0](https://adr.github.io/madr/) : contexte, facteurs de décision, options envisagées, décision, conséquences.
- **J'écris l'ADR avant le code** qu'il justifie, et il passe par une pull request comme le reste.
- **Un ADR accepté ne se modifie plus.** Si je change d'avis, j'écris un nouvel ADR qui remplace l'ancien, et je mets à jour le statut des deux.
- **Les preuves vivent dans l'audit.** Un ADR résume la décision et renvoie vers l'[étude technique](../audit/03-etude-technique.md) pour les sources.

## Index

| N° | Décision | Statut | Date |
| --- | --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Consigner les décisions d'architecture | Acceptée | 2026-10-08 |
| [0002](0002-nextjs-modular-monolith.md) | Une seule application Next.js, découpée en couches | Acceptée | 2026-10-08 |
| [0003](0003-postgresql-drizzle.md) | PostgreSQL et Drizzle ORM | Acceptée | 2026-10-08 |
| [0004](0004-better-auth-database-sessions.md) | Better Auth, sessions en base, Argon2id | Acceptée | 2026-10-08 |
| [0005](0005-next-intl-locale-prefix.md) | next-intl et préfixe de langue dans l'URL | Acceptée | 2026-10-08 |
| [0006](0006-tailwind-design-tokens.md) | Tailwind CSS 4 et jetons de design | Acceptée | 2026-10-08 |
| [0007](0007-testing-strategy.md) | Stratégie de tests | Acceptée | 2026-10-08 |
| [0008](0008-git-workflow.md) | GitHub flow, commits conventionnels, fusion en *squash* | Acceptée | 2026-10-08 |
| [0009](0009-simulated-payment-port.md) | Paiement simulé derrière une interface | Acceptée | 2026-10-08 |
| [0010](0010-docker-compose-local-runtime.md) | Exécution locale avec Docker Compose | Acceptée | 2026-10-08 |
| [0011](0011-pin-eslint-9.md) | Épingler ESLint en version 9 | Acceptée | 2026-10-08 |

Statuts possibles : *Proposée*, *Acceptée*, *Remplacée par NNNN*, *Abandonnée*.

## Gabarit

```markdown
# NNNN — Titre court, à l'infinitif

- Statut : Proposée
- Date : AAAA-MM-JJ
- Exigences concernées : identifiants de l'audit

## Contexte et problème

## Facteurs de décision

## Options envisagées

## Décision

## Conséquences

## Confirmation
```

La rubrique *Confirmation* dit comment je vérifierai que la décision est réellement appliquée : une règle de lint, un test, un point de l'audit final.
