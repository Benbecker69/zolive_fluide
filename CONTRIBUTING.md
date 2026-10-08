# Contribuer à Zolive

Ce document est le contrat de travail du dépôt. Il s'applique à toute modification, y compris la documentation.

Langues : la documentation est en français ; le code, les commits, les issues et les pull requests sont en anglais.

## Le flux en une minute

1. **Une issue** décrit le besoin et ses critères d'acceptation. Pas d'issue, pas de travail.
2. **Une branche** courte part de `main` : `<type>/<numéro-issue>-<résumé>`, par exemple `feat/14-cart-quantity`.
3. **Des commits** atomiques au format Conventional Commits.
4. **Une pull request** liée à l'issue (`Closes #14`), avec la preuve de vérification.
5. **La CI est verte**, la relecture est faite, puis fusion en *squash*. La branche est supprimée.

Ce flux est le [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow). Les branches vivent le moins longtemps possible : les travaux de DORA associent le développement à branches courtes (trois branches actives ou moins, fusion au moins quotidienne) à de meilleures performances de livraison ([DORA, trunk-based development](https://dora.dev/capabilities/trunk-based-development/)).

## Branches

| Règle | Détail |
| --- | --- |
| Branche stable | `main`, toujours livrable, protégée : aucune poussée directe |
| Nommage | `<type>/<issue>-<slug>` avec `type` parmi `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci` |
| Portée | Une branche = une issue = une intention |
| Durée de vie | Quelques heures à deux jours ; au-delà, l'issue est trop grosse et doit être découpée |
| Mise à jour | `git rebase origin/main` avant la demande de fusion |

## Commits

Format [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) :

```text
<type>[scope]: <description à l'impératif, en anglais, sans point final>

[corps : le pourquoi, pas le comment]

[pied : Refs #12, BREAKING CHANGE: ...]
```

| Type | Usage | Effet sur la version ([SemVer](https://semver.org/)) |
| --- | --- | --- |
| `feat` | Nouvelle capacité visible | MINOR |
| `fix` | Correction d'un défaut | PATCH |
| `docs` | Documentation seule | aucun |
| `refactor` | Changement interne sans effet fonctionnel | aucun |
| `perf` | Amélioration de performance | PATCH |
| `test` | Ajout ou correction de tests | aucun |
| `build`, `ci`, `chore` | Outillage, dépendances, pipeline | aucun |

Un changement incompatible se signale par `!` après le type ou par un pied `BREAKING CHANGE:` ; il entraîne une version MAJOR.

Exemples :

```text
feat(cart): persist the cart across sessions
fix(checkout): recompute totals on the server before creating the order
docs(adr): record the choice of database sessions
```

## Pull requests

- **Petite et ciblée.** Une PR fait une chose. Un refactoring préalable part dans sa propre PR.
- **Titre au format Conventional Commits.** La fusion étant en *squash*, le titre devient le commit sur `main` ; la CI le vérifie.
- **Description utile.** Le quoi, le pourquoi, et comment cela a été vérifié (sortie de commande, capture, test).
- **Liée à l'issue** par `Closes #<n>` pour que la fermeture soit automatique.
- **Brouillon** (*draft*) tant que le travail n'est pas prêt à être relu.

### Relecture

Le projet est mené par une seule personne : l'approbation par un tiers ne peut pas être exigée par l'outil. La relecture reste une étape à part entière, faite à froid sur le diff de la PR, avec la liste de contrôle du modèle de PR.

Le critère d'acceptation est celui des pratiques d'ingénierie de Google : une modification est approuvée dès lors qu'elle améliore nettement la santé globale du code, même si elle n'est pas parfaite ; les faits et les données priment sur les préférences personnelles ([Google, *The Standard of Code Review*](https://google.github.io/eng-practices/review/reviewer/standard.html)).

## Definition of Done

Une issue est terminée quand **toutes** les conditions suivantes sont vraies :

- [ ] Les critères d'acceptation de l'issue sont satisfaits et démontrés
- [ ] Le code est couvert par des tests au bon niveau (unitaire, intégration, bout en bout)
- [ ] La CI est verte : lint, typage, tests, build
- [ ] Aucune régression d'accessibilité, de performance ou de sécurité par rapport aux seuils de l'audit
- [ ] Les textes visibles existent en français et en anglais
- [ ] La documentation, les ADR et le `CHANGELOG.md` sont à jour
- [ ] La PR est fusionnée dans `main` et la branche supprimée

## Versions et journal des modifications

Les versions suivent [Semantic Versioning 2.0.0](https://semver.org/). Le fichier `CHANGELOG.md` suit [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) : une entrée par version, la plus récente en premier, regroupée par type de changement.

## Sécurité

Aucun secret dans le dépôt, y compris dans l'historique. Les vulnérabilités se signalent en privé : voir [SECURITY.md](SECURITY.md).
