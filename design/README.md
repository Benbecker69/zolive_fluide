# Maquette et direction artistique

La direction artistique a été validée sur une maquette haute fidélité **avant** tout développement. Ce dossier en est la référence : il fixe ce que le site doit donner à voir, et sert de point de comparaison pendant la recette.

## Contenu du dossier

| Planche | Page autonome | Capture pleine page (1440 px de large) |
| --- | --- | --- |
| Charte graphique | [mockup/charte-graphique.html](mockup/charte-graphique.html) | [screenshots/charte-graphique.png](screenshots/charte-graphique.png) |
| Accueil | [mockup/accueil.html](mockup/accueil.html) | [screenshots/accueil.png](screenshots/accueil.png) |
| Boutique | [mockup/boutique.html](mockup/boutique.html) | [screenshots/boutique.png](screenshots/boutique.png) |
| Fiche produit | [mockup/fiche-produit.html](mockup/fiche-produit.html) | [screenshots/fiche-produit.png](screenshots/fiche-produit.png) |

Les pages HTML s'ouvrent directement dans un navigateur, sans étape de build. Elles chargent leurs polices depuis Google Fonts : une connexion est nécessaire pour un rendu fidèle.

![Accueil](screenshots/accueil.png)

## Ce que la maquette fixe, et ce qu'elle ne fixe pas

**Fixé** : palette, typographies, échelle des titres, rayons, composants (boutons, filtres, étiquettes, champ, carte produit), structure des trois pages, ton rédactionnel.

**Illustratif, à remplacer** :

- le catalogue, les prix et les textes sont fictifs ;
- les produits sont dessinés (bouteilles, bidon, bocal, coffret) : ce sont des pictogrammes de marque, pas des photographies ;
- les zones marquées « Photo » sont des emplacements ;
- le texte entre crochets de l'onglet « Livraison & retours » est une information que seul le commerçant peut fournir.

**Non maquetté** : panier, tunnel de commande, pages de compte, pages légales, états d'erreur et de chargement, version anglaise. Ces écrans seront construits avec les composants de la charte ; chaque écart notable fera l'objet d'une capture dans la pull request.

## Jetons de design

Ces valeurs sont la source du thème de l'application. Toute couleur ou taille utilisée dans le code doit en provenir.

### Couleurs

| Jeton | Valeur | Rôle |
| --- | --- | --- |
| `ground` | `#F7F9F4` | Fond de page |
| `surface` | `#FFFFFF` | Champs, cartes sur fond teinté |
| `ink` | `#11231A` | Texte principal, bouton primaire |
| `brand` | `#1D4A35` | Vert bouteille : bandeaux, pictogrammes, sur-titres |
| `accent` | `#DDEB52` | Citron : mise en avant, bloc lettre d'information |
| `muted` | `#4F6156` | Texte secondaire |
| `on-brand-muted` | `#C9D6C6` | Texte secondaire sur fond `brand` ou `ink` |
| `line` | `#DCE4D5` | Filets de séparation décoratifs |
| `tint-sage` | `#E3ECDB` | Fond de visuel produit |
| `tint-zest` | `#F2F5C6` | Fond de visuel produit |
| `tint-sky` | `#DCEBF1` | Fond de visuel produit |
| `tint-peach` | `#F5E6DC` | Fond de visuel produit |

### Typographie

| Usage | Police | Graisse | Réglages |
| --- | --- | --- | --- |
| Titres | Bricolage Grotesque | 500 (logo : 600) | Interlettrage −0,035 em à −0,045 em, interligne 0,98 à 1,04 |
| Accent dans un titre | Instrument Serif Italic | 400 | Un ou deux mots par titre, corps 1,06 em |
| Texte et interface | Hanken Grotesk | 400, 500, 600 | Corps de base 16 px, interligne 1,55 |

Échelle fluide des titres : H1 `clamp(44px, 6vw, 88px)` ; H2 `clamp(34px, 3.8vw, 54px)` ; H3 de carte 20 px à 32 px. Sur-titres : 12 px, capitales, interlettrage 0,12 em.

### Formes et espacements

| Jeton | Valeur |
| --- | --- |
| Rayon des blocs | 40 px |
| Rayon des cartes et visuels | 28 px |
| Rayon des contrôles (boutons, champs, étiquettes) | 999 px (pilule) |
| Largeur utile maximale | 1280 px, marges latérales `clamp(20px, 4vw, 48px)` |
| Espacement vertical entre sections | 104 px à 120 px |
| Hauteur minimale d'une cible cliquable | 44 px |
| Icônes | Trait 1,6 px, 20 px, extrémités arrondies |

## Vérification des contrastes

Les rapports ci-dessous sont calculés avec la formule de luminance relative des WCAG. Le critère 1.4.3 (niveau AA) exige au moins 4,5:1 pour le texte courant et 3:1 pour le texte de grande taille ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)).

| Texte | Fond | Rapport | AA texte courant |
| --- | --- | --- | --- |
| `ink` | `ground` | 15,49:1 | Conforme |
| `ink` | `surface` | 16,42:1 | Conforme |
| `muted` | `ground` | 6,24:1 | Conforme |
| `muted` | `surface` | 6,61:1 | Conforme |
| `muted` | `tint-sage` | 5,44:1 | Conforme |
| `muted` | `tint-zest` | 5,87:1 | Conforme |
| `muted` | `tint-sky` | 5,41:1 | Conforme |
| `muted` | `tint-peach` | 5,43:1 | Conforme |
| `brand` | `ground` | 9,51:1 | Conforme |
| `ground` | `brand` | 9,51:1 | Conforme |
| `on-brand-muted` | `brand` | 6,68:1 | Conforme |
| `accent` | `brand` | 7,72:1 | Conforme |
| `accent` | `ink` | 12,57:1 | Conforme |
| `ink` | `accent` | 12,57:1 | Conforme |

### Écart relevé

Le filet `line` (`#DCE4D5`) n'atteint que **1,23:1** sur `ground` et 1,30:1 sur `surface`. C'est sans conséquence pour un séparateur décoratif, mais la maquette l'emploie aussi comme **seul contour** de contrôles interactifs : filtres non sélectionnés, sélecteur de quantité, liste de tri. Or le contour d'un composant d'interface doit présenter un contraste d'au moins 3:1 avec les couleurs adjacentes (WCAG 2.2, critère 1.4.11, niveau AA).

Décision : la maquette n'est pas modifiée, elle reste le reflet de ce qui a été validé. L'écart est corrigé à l'implémentation par un jeton dédié aux contours de contrôles, à 3:1 minimum ; il est suivi dans l'issue du système de design.

## Régénérer les captures

Les captures sont produites par Chrome en mode sans interface, à 1440 px de large, à partir des pages de `mockup/`. Elles doivent être régénérées si une page est modifiée.
