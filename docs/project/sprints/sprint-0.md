# Sprint 0 — Cadrage : revue et rétrospective

- Date de clôture : 8 octobre 2026
- Objectif du sprint : savoir quoi construire, comment, et comment le prouver
- Résultat : **objectif atteint**, sous réserve de ma relecture d'ensemble avant le lancement du sprint 1

## Revue

### Ce que j'ai livré

Chaque livrable est passé par une issue, une branche, une pull request et les trois vérifications de la CI.

| Issue | Pull request | Livrable | Comment je l'ai vérifié |
| --- | --- | --- | --- |
| [#1](https://github.com/Benbecker69/zolive_fluide/issues/1) | [#7](https://github.com/Benbecker69/zolive_fluide/pull/7) | Règles de contribution, modèles d'issues et de PR, politique de sécurité, CI documentaire, protection de `main` | Une poussée directe sur `main` est refusée par GitHub (erreur GH013) ; les trois vérifications sont requises |
| [#2](https://github.com/Benbecker69/zolive_fluide/issues/2) | [#8](https://github.com/Benbecker69/zolive_fluide/pull/8) | Maquette dans le dépôt, jetons de design, table des contrastes | Rendu des quatre pages à 1440 px ; rapports de contraste calculés |
| [#3](https://github.com/Benbecker69/zolive_fluide/issues/3) | [#9](https://github.com/Benbecker69/zolive_fluide/pull/9) | Audit de cadrage : périmètre, exigences, étude technique, risques, plan de l'audit final, sources | Chaque référence `[Sxx]` est définie dans la bibliographie ; versions lues sur le registre npm |
| [#4](https://github.com/Benbecker69/zolive_fluide/issues/4) | [#11](https://github.com/Benbecker69/zolive_fluide/pull/11) | Dix décisions d'architecture | Chaque ADR cite les exigences qu'il sert et renvoie aux preuves |
| [#5](https://github.com/Benbecker69/zolive_fluide/issues/5) | [#41](https://github.com/Benbecker69/zolive_fluide/pull/41) | Plan de projet, architecture cible, backlog | Totaux de points recalculés à partir des issues ; les sept diagrammes sont rendus sans erreur |
| [#10](https://github.com/Benbecker69/zolive_fluide/issues/10) | [#42](https://github.com/Benbecker69/zolive_fluide/pull/42) | Guides de méthode et listes de contrôle | Chiffres cités recomptés dans le dépôt |
| [#43](https://github.com/Benbecker69/zolive_fluide/issues/43) | [#45](https://github.com/Benbecker69/zolive_fluide/pull/45) | Harmonisation du ton des trois premiers documents | Relecture du diff : aucun changement de règle |

### En chiffres

| Indicateur | Valeur |
| --- | --- |
| Exigences de qualité identifiées | 55, dans huit domaines |
| Risques suivis | 14 |
| Sources référencées | 54, chacune avec son niveau de vérification |
| Décisions d'architecture | 10 |
| Issues du backlog produit | 29, pour 127 points estimés |
| Pull requests fusionnées | 7 avant celle-ci, toutes avec une CI verte |

### Ce que le cadrage a fait apparaître

Ces constats n'étaient pas prévisibles avant d'instruire les sujets. Ce sont eux qui justifient d'avoir cadré avant de coder.

| Constat | Conséquence |
| --- | --- |
| Sur la maquette, le contour des contrôles interactifs n'atteint que 1,23:1 de contraste, pour 3:1 exigé | Jeton dédié prévu à l'implémentation ([ADR 0006](../../adr/0006-tailwind-design-tokens.md), issue [#15](https://github.com/Benbecker69/zolive_fluide/issues/15)) |
| L'étiquette `latest` de Prisma pointe sur une version candidate, que la bibliothèque d'authentification ne supporte pas | Choix de Drizzle ORM ([ADR 0003](../../adr/0003-postgresql-drizzle.md)) |
| TypeScript 7 n'est pas encore supporté par l'outil d'analyse statique | TypeScript épinglé en 6.0 (risque R-04) |
| Une CSP stricte à *nonces* désactive les pages statiques | Arbitrage par zone, à confirmer en sprint 4 (risque R-06) |
| L'exclusion du droit de rétractation pour les biens périssables ne couvre pas les denrées à date de durabilité minimale | L'huile d'olive reste couverte ; les conditions de vente en tiennent compte (LEG-03) |
| Les *Must* représentent 87 % de l'effort estimé, au-dessus des 60 % conseillés par DSDM | Règle : aucun *Should* ne démarre avant la fin des *Must* du sprint ([plan de projet](../plan-de-projet.md)) |

### Écarts et points ouverts

| Point | État | Suite |
| --- | --- | --- |
| Grille d'évaluation détaillée de la formation | Je ne l'ai pas encore | Je la demande ; je tracerai chaque critère vers un livrable (risque R-12) |
| Textes officiels que je n'ai pas relus : directive (UE) 2019/882 et sa transposition, article L. 221-14 du Code de la consommation | Signalés dans l'audit, sans affirmation qui en dépende | À lire avant l'issue des pages légales ([#31](https://github.com/Benbecker69/zolive_fluide/issues/31)) |
| Versions des dépendances | Constat daté du 8 octobre 2026 | Revérifiées par la première issue du sprint 1 ([#12](https://github.com/Benbecker69/zolive_fluide/issues/12)) |
| Vélocité | Inconnue | Mesurée à la fin du sprint 1, puis utilisée pour replanifier |

### Incident

À la première tentative, GitHub a refusé la poussée des fichiers de CI : mon jeton d'accès n'avait pas le droit `workflow`. J'ai étendu les droits du jeton et repris. Aucun contournement : la protection de `main`, décrite dans la documentation de GitHub [S47], n'a été activée qu'une fois les vérifications en place, puis testée par une poussée directe, refusée comme attendu.

## Rétrospective

### Ce qui a bien fonctionné

- **Poser les exigences avant les outils.** L'étude technique a eu un cahier des charges : chaque technologie a été évaluée contre des identifiants d'exigence, pas contre une impression.
- **Vérifier sur le registre plutôt que dans des articles.** Les deux décisions les moins évidentes du projet, l'ORM et la version de TypeScript, viennent de commandes sur le registre npm, pas d'un comparatif.
- **Mettre la CI en place sur un dépôt vide.** Dès la deuxième pull request, la mise en forme et les liens étaient vérifiés automatiquement. Je n'ai eu aucun lien cassé à corriger après coup.
- **Écrire le plan de l'audit final dès maintenant.** Cela m'a obligé à reformuler plusieurs exigences que je n'aurais pas su mesurer.

### Ce qui a moins bien fonctionné

- **J'ai dû reprendre le ton des trois premiers documents** (issue #43), écrits de manière impersonnelle avant que je fixe la convention. La convention de rédaction aurait dû être posée dans la première issue.
- **Je n'ai pas vérifié mes droits d'accès avant de commencer**, d'où l'incident sur la CI.
- **Je n'ai pas lu certains textes officiels** et j'ai dû m'appuyer sur des sources secondaires pour deux points juridiques. Je les ai signalés, mais c'est une dette.

### Action d'amélioration pour le sprint 1

Une seule, pour être sûr de la tenir :

> **Je lis les textes officiels que je n'ai pas relus avant de démarrer l'issue des pages légales (#31), et je mets à jour la bibliographie et les exigences LEG-07 et d'accessibilité en conséquence.**

Je vérifierai à la rétrospective du sprint 3, où cette issue est planifiée, que c'est fait.

## Décision de passage

Le cadrage est complet. Je relis l'ensemble une dernière fois ; si rien ne manque, je lance le sprint 1 par l'issue [#12](https://github.com/Benbecker69/zolive_fluide/issues/12), qui monte toute la chaîne d'outils sur un squelette vide avant toute fonctionnalité.

## Sources

L'identifiant `[S47]` renvoie à la [bibliographie de l'audit](../../audit/sources.md).
