# 0006 — Tailwind CSS 4 et jetons de design

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-02, A11Y-02, A11Y-03, PERF-05, PERF-06

## Contexte et problème

La maquette fixe une palette, trois polices, des rayons et une échelle de titres. Je dois garantir que le code n'utilise que ces valeurs, et corriger l'écart de contraste que j'ai relevé sur les contours de contrôles.

## Facteurs de décision

- Une seule source pour les valeurs de design.
- Impossible, ou au moins visible, d'utiliser une valeur hors charte.
- Pas de JavaScript supplémentaire côté navigateur pour les styles.

## Options envisagées

1. CSS écrit à la main, avec des variables CSS.
2. Tailwind CSS 4.
3. Une bibliothèque de composants prête à l'emploi.

## Décision

Je retiens **Tailwind CSS 4**, configuré par la directive `@theme` : chaque jeton de la [fiche de la maquette](../../design/README.md) devient une variable de thème, qui produit à la fois des classes utilitaires et une variable CSS.

Règles associées :

- la palette par défaut de Tailwind est désactivée : seules les couleurs de la charte ont une classe ;
- j'ajoute un jeton `control-line` pour les contours de contrôles interactifs, avec un contraste d'au moins 3:1 sur `ground` et sur `surface` ; le jeton `line` reste réservé aux filets décoratifs ;
- les polices sont servies par l'application elle-même, sans requête vers un domaine tiers ;
- les composants de la charte vivent dans `ui/` et sont les seuls à combiner des classes ; les pages assemblent des composants.

J'écarte l'option 3 : la charte ne compte qu'une dizaine de composants, tous spécifiques ; une bibliothèque m'obligerait à défaire son style avant d'appliquer le mien. L'option 1 était viable, mais elle ne m'empêche pas d'écrire une couleur hors palette.

## Conséquences

- Positif : la charte est exprimée une fois ; un écart de couleur se voit en relecture parce qu'il exige une valeur arbitraire.
- Négatif : les listes de classes alourdissent le balisage ; je les confine aux composants de `ui/`.
- Négatif : le rendu des contrôles différera légèrement de la maquette sur le contour. C'est voulu, et documenté.

## Confirmation

- Règle de lint interdisant les valeurs de couleur arbitraires hors de `ui/`.
- Calcul des contrastes rejoué sur les jetons réellement utilisés, à l'audit final.
- Onglet réseau : aucune requête vers un domaine tiers.

## Références

[Étude technique](../audit/03-etude-technique.md), section « Interface et styles » ; [fiche de la maquette](../../design/README.md), section « Écart relevé ».
