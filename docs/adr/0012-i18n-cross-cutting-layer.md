# 0012 — Faire de l'internationalisation une couche transverse

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : I18N-01, I18N-02, I18N-03, MAINT-01
- Complète : [ADR 0002](0002-nextjs-modular-monolith.md), [ADR 0005](0005-next-intl-locale-prefix.md)

## Contexte et problème

L'ADR 0002 autorise la couche `app` à importer `i18n`, mais ne dit rien des autres couches. En mettant en place le routage par langue, j'ai constaté que la question se pose tout de suite : chaque lien du site doit conserver le préfixe de langue, et les liens sont produits par les composants de `ui/` (boutons-liens, filtres, cartes produit, en-tête).

Avec le composant de lien standard de Next.js, un lien vers `/boutique` depuis la version anglaise ramène sur la racine sans préfixe, puis redirige selon la langue du navigateur : le visiteur change de langue sans l'avoir demandé.

## Facteurs de décision

- Aucun lien ne doit pouvoir perdre la langue courante.
- Les composants de `ui/` doivent rester indépendants du métier.
- La règle doit être vérifiable par le linter, comme les autres frontières.

## Options envisagées

1. Garder `ui/` sans dépendance : les pages calculent des URL déjà préfixées et les passent aux composants.
2. Autoriser `ui/` et `features/` à importer la couche `i18n`, qui n'importe rien.
3. Placer la navigation localisée dans `lib/`.

## Décision

Je retiens l'option 2. La couche `i18n/` devient transverse.

| Couche | Peut importer |
| --- | --- |
| `app/` | `features`, `ui`, `i18n` |
| `features/` | `data`, `ui`, `lib`, `i18n` |
| `ui/` | `lib`, `i18n` |
| `data/` | `lib` |
| `i18n/` | rien |
| `lib/` | rien |

Deux règles l'accompagnent :

- l'import du lien standard de Next.js est interdit partout hors de `i18n/` : le seul lien disponible est celui qui conserve la langue ;
- les composants de `ui/` ne reçoivent toujours aucun texte en dur : leurs libellés leur sont passés par les pages, déjà traduits. `ui/` dépend de la navigation localisée, pas des messages.

J'écarte l'option 1 : chaque page devrait préfixer chaque URL à la main, et un oubli ne se verrait qu'en production, dans une seule langue. J'écarte l'option 3 : `lib/` est réservé aux utilitaires purs, sans dépendance au framework.

## Conséquences

- Positif : la conservation de la langue est garantie par construction, et l'oubli est une erreur de lint.
- Négatif : `ui/` n'est plus réutilisable hors d'un contexte de langue. Je l'accepte : ces composants n'ont pas vocation à sortir du site.
- La page de charte graphique, écrite en français uniquement, est exemptée de la règle « pas de texte en dur » et n'est servie que sous `/fr`.

## Confirmation

- `tests/tooling/layer-boundaries.test.ts` vérifie les nouvelles autorisations et les interdictions restantes.
- `tests/tooling/translations.test.ts` vérifie que l'import du lien standard est rejeté.
- `e2e/i18n.spec.ts` vérifie que le sélecteur de langue mène à la même page dans l'autre langue.
