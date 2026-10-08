# 0002 — Une seule application Next.js, découpée en couches

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : SEC-01, SEC-02, SEC-13, MAINT-01, MAINT-03, PERF-01 à PERF-04

## Contexte et problème

Le site mêle des pages de catalogue publiques, qui doivent être rapides et bien référencées, et des parcours authentifiés et transactionnels : panier, commande, compte. Je pars sur Next.js ; il me reste à décider comment structurer l'application pour qu'elle reste sûre et modifiable.

L'écosystème a connu en 2025 deux failles critiques, dont l'une permettait de contourner entièrement le *middleware*. Je ne peux donc pas faire reposer la sécurité sur une seule couche du framework.

## Facteurs de décision

- Une seule personne développe et exploite : la simplicité de déploiement compte.
- L'autorisation doit être vérifiée au plus près de la donnée.
- Les dépendances entre parties du code doivent être contrôlables par l'outillage.

## Options envisagées

1. Une interface Next.js et une API séparée (deux applications).
2. Une seule application Next.js, avec les requêtes à la base écrites directement dans les composants.
3. Une seule application Next.js, découpée en couches, avec une couche d'accès aux données isolée.

## Décision

Je retiens l'option 3 : un monolithe modulaire.

| Couche | Rôle | Peut importer |
| --- | --- | --- |
| `app/` | Routes, pages, mises en page, actions serveur minces | `features`, `ui`, `i18n` |
| `features/<domaine>/` | Cas d'usage et composants d'un domaine : catalogue, panier, commande, compte | `data`, `ui`, `lib` |
| `data/` | Seul endroit qui parle à la base et lit l'environnement ; vérifie l'autorisation ; renvoie des objets minimaux | `lib` |
| `ui/` | Composants de la charte, sans logique métier | `lib` |
| `lib/` | Utilitaires purs | rien |

Règles associées :

- Un seul mode d'accès aux données dans tout le projet : la couche `data/`, marquée `server-only`.
- Chaque fonction de `data/` qui touche une donnée de client vérifie la session et la propriété de la ressource.
- Une action serveur valide son entrée, délègue à `data/` et ne renvoie que ce dont l'interface a besoin.
- Le fichier `proxy.ts` ne sert qu'au routage par langue et aux redirections de confort ; ce n'est jamais un contrôle d'accès.

Versions : Next.js 16 (branche *Active LTS*), React 19, TypeScript 6.0 en mode strict, Node.js 24 LTS, Zod pour la validation.

J'écarte l'option 1 : deux déploiements, deux pipelines et un contrat d'API à maintenir, pour une équipe d'une personne. J'écarte l'option 2 : la documentation de Next.js la réserve aux prototypes, parce qu'elle facilite l'exposition accidentelle de données privées.

## Conséquences

- Positif : un seul artefact à construire et à lancer ; l'autorisation est centralisée, donc auditable ; l'ORM et la base sont confinés à un dossier.
- Négatif : la discipline de couches ne tient que si l'outillage la vérifie ; je dois écrire et maintenir la règle de lint.
- Négatif : je reste exposé aux failles côté serveur du framework. Je m'engage à suivre la branche supportée et à appliquer un correctif de sécurité sous sept jours.
- Négatif : TypeScript est épinglé en 6.0, une version majeure en arrière, tant que `typescript-eslint` ne supporte pas la 7.

## Confirmation

- Règle de lint sur les imports entre couches, bloquante en CI.
- Tests d'intégration d'accès croisé entre deux comptes sur chaque fonction de `data/`.
- Revue des fichiers `use server` et de `proxy.ts` à l'audit final.

## Références

[Étude technique](../audit/03-etude-technique.md), sections « Framework d'application » et « Langage et environnement d'exécution » ; [exigences de sécurité](../audit/02-exigences-qualite.md).
