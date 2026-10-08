# 0003 — PostgreSQL et Drizzle ORM

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : SEC-03, SEC-07, MAINT-01, OPS-03, OPS-06

## Contexte et problème

Une commande doit, d'un seul tenant, vérifier le stock, le décrémenter et figer les prix. Il me faut une base relationnelle transactionnelle et un moyen typé de l'interroger depuis TypeScript.

## Facteurs de décision

- Transactions et contraintes d'intégrité.
- Compatibilité déclarée avec la bibliothèque d'authentification retenue (ADR 0004).
- Stabilité de l'outil au moment où je démarre.
- Migrations lisibles en relecture.

## Options envisagées

Pour la base : PostgreSQL, MySQL, SQLite.

Pour l'accès aux données : Drizzle ORM 0.45, Prisma 7 (stable), Prisma 8 (version candidate), requêtes SQL écrites à la main.

## Décision

**PostgreSQL 18**, image officielle `postgres:18-alpine`. C'est la base la plus utilisée selon l'enquête Stack Overflow 2025, et mon besoin est relationnel et transactionnel. SQLite ne convient pas à des écritures concurrentes sur le stock.

**Drizzle ORM**, version exacte épinglée, avec des migrations SQL générées et versionnées.

Ce qui a fait pencher la balance le 8 octobre 2026 :

- l'étiquette `latest` de Prisma sur npm pointe sur une version candidate (8.0.0-rc.21) ; la dernière version stable, 7.10.0, est rangée sous `prev` ;
- la documentation de Prisma décrit déjà les commandes de migration de la version 8, différentes de celles de la 7 ;
- Better Auth déclare supporter Prisma 5, 6 et 7, pas la 8, alors qu'il supporte Drizzle 0.45.

Démarrer sur Prisma revenait donc à programmer une migration majeure dès le premier jour. J'écarte le SQL à la main : je perdrais le typage des résultats.

## Conséquences

- Positif : schéma en TypeScript, pas d'étape de génération de code, migrations en SQL relisibles dans les pull requests.
- Négatif : Drizzle est en version 0.x ; selon Semantic Versioning, son API peut changer à tout moment.
- Parade : version exacte épinglée ; l'ORM n'est importé que dans `data/` ; chaque requête de cette couche a un test d'intégration contre une vraie base PostgreSQL.
- À surveiller : la sortie de Drizzle 1.0, qui fera l'objet d'un lot dédié.

## Confirmation

- La règle de lint interdit d'importer `drizzle-orm` hors de `data/`.
- Les tests d'intégration tournent contre PostgreSQL en CI.
- Test de concurrence sur le dernier article en stock (SEC-07).

## Références

[Étude technique](../audit/03-etude-technique.md), section « Base de données et accès aux données » ; [registre des risques](../audit/04-risques.md), R-02.
