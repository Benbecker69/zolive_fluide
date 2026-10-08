# 0008 — GitHub flow, commits conventionnels, fusion en squash

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-06, SEC-10

## Contexte et problème

Je veux un historique qui se lise comme le journal du projet, et une branche `main` toujours livrable. Je dois choisir un modèle de branches, un format de commit et une méthode de fusion.

## Facteurs de décision

- Seul sur le projet : pas de branche de coordination à entretenir.
- Chaque changement doit être rattaché à un besoin.
- L'historique de `main` doit permettre de produire le journal des modifications.

## Options envisagées

1. Pousser directement sur `main`.
2. Git flow : branches `develop`, `release`, `hotfix`.
3. GitHub flow : `main` et des branches courtes fusionnées par pull request.

## Décision

Je retiens l'option 3.

| Sujet | Règle |
| --- | --- |
| Point de départ | Une issue, avec ses critères d'acceptation |
| Branche | `<type>/<issue>-<résumé>`, depuis `main`, durée de vie de quelques heures à deux jours |
| Commits | Conventional Commits 1.0.0, en anglais, à l'impératif |
| Pull request | Une par issue, liée par `Closes #n`, avec la preuve de vérification |
| Fusion | *Squash* uniquement : une pull request donne un commit sur `main`, dont le message est le titre de la pull request |
| Protection de `main` | Pull request obligatoire, vérifications de CI obligatoires, historique linéaire, pas de poussée forcée ni de suppression |
| Versions | Semantic Versioning ; `CHANGELOG.md` au format Keep a Changelog |

Pourquoi le *squash* : les commits d'une branche racontent mon travail, avec ses essais ; `main` doit raconter le produit. Un commit par pull request donne un historique lisible et facile à annuler. Le détail reste consultable dans la pull request.

J'écarte l'option 1 : elle supprime le point de contrôle où la CI et la relecture ont lieu. J'écarte l'option 2 : ses branches longues servent à coordonner des équipes et des versions parallèles, ce que je n'ai pas ; et les travaux de DORA associent les branches courtes et les fusions fréquentes à de meilleures performances de livraison.

## Conséquences

- Positif : chaque commit de `main` correspond à une issue fermée et à une CI verte.
- Négatif : je ne peux pas exiger l'approbation d'un tiers, étant seul ; la règle de protection demande donc zéro approbation, et je compense par une relecture à froid avec la liste du modèle de pull request.
- Négatif : le détail des commits intermédiaires disparaît de `main`.

## Confirmation

- La règle de protection de `main` est active : une poussée directe est refusée par GitHub.
- La CI vérifie le format du titre de chaque pull request.
- À l'audit final, je vérifie que tous les commits de `main` respectent le format et renvoient à une pull request.

## Références

`CONTRIBUTING.md` à la racine du dépôt ; [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) ; [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) ; [DORA, trunk-based development](https://dora.dev/capabilities/trunk-based-development/).
