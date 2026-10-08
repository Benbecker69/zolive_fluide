# 0011 — Épingler ESLint en version 9

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-01, MAINT-03

## Contexte et problème

Dans l'étude technique, j'avais prévu ESLint 10, la version la plus récente. En montant le squelette, j'ai revérifié les dépendances déclarées, comme le demandait la première issue du sprint 1.

`eslint-config-next` 16.4.0 embarque trois greffons qui ne déclarent pas la compatibilité avec ESLint 10 :

| Greffon | Version | Versions d'ESLint déclarées |
| --- | --- | --- |
| `eslint-plugin-react` | 7.37.5 | jusqu'à `^9.7` |
| `eslint-plugin-import` | 2.32.0 | jusqu'à `^9` |
| `eslint-plugin-jsx-a11y` | 6.10.2 | jusqu'à `^9` |

Seul `eslint-plugin-react-hooks` 7.1.1 déclare `^10.0.0`. Ces valeurs viennent du registre npm (`npm view <paquet> peerDependencies`), consulté le 8 octobre 2026.

De son côté, npm signale ESLint 9.39.5 comme déprécié depuis la sortie de la version 10.

## Facteurs de décision

- La règle de couches de l'ADR 0002 repose sur ESLint : je ne peux pas me permettre un linter au comportement incertain.
- Les règles d'accessibilité de `eslint-plugin-jsx-a11y` servent directement mes exigences.
- Je préfère une version ancienne mais supportée par mes greffons à une version récente hors des plages déclarées.

## Options envisagées

1. ESLint 10, en ignorant les avertissements de dépendances.
2. ESLint 9, dernière version de la branche.
3. Abandonner `eslint-config-next` et assembler mes propres règles pour ESLint 10.

## Décision

Je retiens l'option 2 : **ESLint 9.39.5**, version exacte épinglée.

J'écarte l'option 1 : trois greffons tourneraient hors de leur plage déclarée, et une erreur de leur part se manifesterait par des règles silencieusement inactives, donc par une fausse assurance. J'écarte l'option 3 : je perdrais les règles propres à Next.js et celles d'accessibilité, pour un gain nul sur le produit.

## Conséquences

- Positif : toute la chaîne d'analyse statique tourne dans des plages de versions déclarées par ses auteurs.
- Négatif : je dépends d'une version marquée comme dépréciée. Elle ne recevra pas les nouveautés de la version 10.
- C'est la même situation que pour TypeScript, épinglé en 6.0 (ADR 0002) : l'outillage d'analyse suit avec retard les versions majeures.

## Confirmation

- Les tests `tests/tooling/layer-boundaries.test.ts` prouvent que les règles de couches sont actives : ils échouent si une importation interdite n'est plus signalée.
- Signal de révision : une version d'`eslint-config-next` dont tous les greffons déclarent ESLint 10. Suivi dans le [registre des risques](../audit/04-risques.md), R-15.

## Références

[Étude technique](../audit/03-etude-technique.md), section « Qualité du code et outillage », qui reste le constat daté d'avant installation.
