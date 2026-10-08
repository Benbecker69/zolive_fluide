# 0007 — Stratégie de tests

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-05, SEC-01, SEC-07, A11Y-04, A11Y-08, PERF-04, OPS-03

## Contexte et problème

Je n'ai pas de relecteur. Les tests sont mon principal filet de sécurité : je dois décider quoi tester, à quel niveau, et ce qui bloque une fusion.

## Facteurs de décision

- Un retour rapide sur les règles métier.
- La preuve que les contrôles d'accès tiennent.
- Des tests de bout en bout peu nombreux et fiables.
- Les mêmes conditions en local et en CI.

## Options envisagées

1. Tout tester de bout en bout, dans le navigateur.
2. Ne tester qu'unitairement, avec une base simulée.
3. Une pyramide : beaucoup de tests unitaires, des tests d'intégration sur une vraie base, peu de tests de bout en bout.

## Décision

Je retiens l'option 3.

| Niveau | Outil | Ce que j'y teste | Bloquant |
| --- | --- | --- | --- |
| Unitaire | Vitest | Calcul du panier et des totaux, règles de commande, schémas de validation, formatage | Oui |
| Intégration | Vitest et PostgreSQL | Chaque fonction de `data/` : résultat, autorisation, accès croisé entre deux comptes, transaction de commande | Oui |
| Bout en bout | Playwright | Les trois parcours clés, en français et en anglais, dont un au clavier seul | Oui |
| Accessibilité | axe-core dans Playwright | Chaque page des parcours | Oui pour les violations « sérieuses » et « critiques » |
| Performance | Lighthouse CI | Accueil, boutique, fiche produit | Oui sous le seuil |

Règles associées :

- la base de test est une vraie instance PostgreSQL, réinitialisée par un jeu de données déterministe avant chaque exécution ;
- les éléments sont ciblés par leur rôle et leur nom accessible, jamais par une classe CSS : un test qui passe prouve aussi que l'élément est nommé ;
- un test instable est corrigé ou mis en quarantaine sous 24 heures, avec une issue ; je ne relance jamais un test « pour voir » ;
- couverture de lignes d'au moins 80 % sur les règles métier ; je ne fixe pas de seuil global, qui pousserait à écrire des tests sans valeur.

J'écarte l'option 1 : lente, fragile, et elle localise mal les défauts. J'écarte l'option 2 : une base simulée ne prouve ni les contraintes, ni les transactions, ni les contrôles d'accès.

## Conséquences

- Positif : chaque exigence de sécurité critique a un test qui échoue si elle est violée.
- Négatif : la CI doit lancer PostgreSQL et un navigateur ; elle sera plus longue. Je surveille sa durée et je parallélise si besoin.
- Négatif : le jeu de données de test devient un actif à maintenir.

## Confirmation

Rapport de couverture et rapports de tests publiés par la CI ; les cinq vérifications sont requises pour fusionner dans `main`.

## Références

[Étude technique](../audit/03-etude-technique.md), section « Tests » ; [plan de l'audit final](../audit/05-plan-audit-final.md).
