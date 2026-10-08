# 0005 — next-intl et préfixe de langue dans l'URL

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : I18N-01 à I18N-05, A11Y-07

## Contexte et problème

Le site existe en français et en anglais. Je dois décider comment la langue apparaît dans l'URL, où vivent les textes et comment je formate les prix et les dates.

## Facteurs de décision

- Chaque page doit avoir une URL propre par langue, pour le référencement et le partage.
- Aucun texte visible ne doit rester en dur dans le code.
- Les pages du catalogue doivent pouvoir rester statiques.

## Options envisagées

1. Les mécanismes natifs de Next.js seuls : segment `[lang]` et dictionnaires JSON.
2. next-intl.
3. Une autre bibliothèque citée par la documentation de Next.js.

## Décision

Je retiens **next-intl**, avec ces conventions :

- préfixe de langue toujours présent : `/fr/...` et `/en/...` ; la racine redirige vers la langue préférée du navigateur, à défaut le français ;
- un fichier de messages par langue, `messages/fr.json` et `messages/en.json`, organisé par domaine fonctionnel ;
- prix, dates et nombres formatés par la bibliothèque, jamais à la main ;
- le français est la langue de référence : une clé absente en anglais fait échouer la CI.

L'option 1 couvre le routage et les dictionnaires, mais pas le formatage ni les pluriels : je devrais les écrire. next-intl est la première bibliothèque listée par la documentation de Next.js et déclare la compatibilité avec la version 16.

Le contenu du catalogue (noms et descriptions des produits) est traduit en base, dans des colonnes par langue, et non dans les fichiers de messages : c'est une donnée, pas un texte d'interface.

## Conséquences

- Positif : URL explicites, balises `hreflang` simples à générer, attribut `lang` toujours juste.
- Négatif : chaque texte ajouté doit l'être dans deux fichiers ; je le fais vérifier par la CI plutôt que par ma mémoire.
- Négatif : le routage par langue passe par `proxy.ts`, que je garde strictement limité à cet usage (ADR 0002).

## Confirmation

- Test automatisé : aucune clé manquante entre les deux fichiers de messages.
- Règle de lint : pas de texte littéral dans le JSX.
- Tests de bout en bout des trois parcours clés dans les deux langues.

## Références

[Étude technique](../audit/03-etude-technique.md), section « Internationalisation ».
