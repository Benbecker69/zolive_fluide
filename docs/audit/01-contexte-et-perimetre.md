# 01 — Contexte et périmètre

## Contexte

Zolive est une marque fictive d'huiles d'olive et d'épicerie fine. Je conçois et je réalise sa boutique en ligne dans le cadre de mon mastère Lead Développeur à l'EEMI.

Je suis évalué en priorité sur la **manière de mener le projet** : cadrage, justification des choix, organisation agile, qualité et documentation. Le site est le support de cette démonstration ; il doit fonctionner de bout en bout, mais sa richesse fonctionnelle passe après la rigueur de la démarche.

## Parties prenantes

| Partie prenante | Rôle | Attente principale |
| --- | --- | --- |
| Moi, comme porteur du projet | Commanditaire et *product owner* : j'arbitre le périmètre et je valide les incréments | Un site conforme à la maquette, une démarche irréprochable |
| Moi, comme lead développeur | Je conçois, je réalise, je documente et je garantis la qualité | Des décisions traçables et un incrément livrable à chaque sprint |
| Formateur | Évalue la démarche et les livrables | Pouvoir vérifier chaque choix : sources, preuves, historique Git |
| Visiteur (fictif) | Parcourt le catalogue | Trouver vite un produit, comprendre ce qui le distingue |
| Client (fictif) | Commande et suit ses commandes | Un tunnel de commande clair, un compte sûr |

Je tiens les deux premiers rôles. Pour ne pas les confondre, je les sépare dans les outils : je prends les décisions de périmètre dans les issues, et les décisions techniques dans les ADR.

## Objectifs

### Objectifs du produit

1. Un visiteur trouve un produit et l'ajoute au panier en moins de trois interactions depuis l'accueil.
2. Un client crée un compte, passe une commande avec un paiement simulé et la retrouve dans son historique.
3. Le site est utilisable au clavier et avec un lecteur d'écran, en français et en anglais.

### Objectifs du projet

1. Je consigne, je source et je date chaque décision structurante.
2. Chaque ligne de code arrive sur `main` par une issue, une branche et une pull request dont la CI est verte.
3. Je prouve la qualité par des mesures reproductibles, je ne la déclare pas.

## Périmètre fonctionnel

Je priorise avec la méthode MoSCoW du cadre DSDM : *Must* (indispensable à la version), *Should* (important, non vital), *Could* (souhaitable, premier sacrifié), *Won't* (exclu de cette version) [S14].

| Domaine | Fonction | Priorité |
| --- | --- | --- |
| Catalogue | Page d'accueil conforme à la maquette | Must |
| Catalogue | Liste des produits avec filtre par rayon et tri | Must |
| Catalogue | Fiche produit avec choix du format et de la quantité | Must |
| Catalogue | Profil de dégustation et produits associés sur la fiche | Should |
| Panier | Ajouter, modifier la quantité, retirer ; panier conservé entre deux visites | Must |
| Panier | Fusion du panier invité avec celui du compte à la connexion | Should |
| Compte | Inscription, connexion, déconnexion par e-mail et mot de passe | Must |
| Compte | Page de compte : coordonnées et adresse de livraison | Must |
| Compte | Suppression du compte et de ses données personnelles | Should |
| Commande | Tunnel : adresse, récapitulatif, validation | Must |
| Commande | Paiement simulé avec scénarios de succès et d'échec | Must |
| Commande | Création de la commande : contrôle du stock et recalcul des prix côté serveur | Must |
| Commande | Confirmation, historique et détail des commandes du client | Must |
| Transverse | Interface en français et en anglais, bascule de langue | Must |
| Transverse | Pages légales : mentions légales, conditions de vente, confidentialité | Must |
| Transverse | En-têtes de sécurité, limitation des tentatives de connexion | Must |
| Transverse | Référencement : métadonnées, `hreflang`, plan du site, données structurées produit | Should |
| Transverse | Inscription à la lettre d'information | Could |
| Transverse | Recherche plein texte dans le catalogue | Could |

## Hors périmètre de cette version

| Exclu | Raison |
| --- | --- |
| Paiement réel | Mon choix de périmètre : aucun prestataire, aucun flux financier |
| Mise en ligne publique | Mon choix de périmètre : exécution locale sous Docker |
| Interface d'administration (produits, commandes) | Le catalogue est chargé par un script d'initialisation ; un *back-office* doublerait le périmètre |
| Envoi réel d'e-mails | Les messages (confirmation de commande) sont produits mais écrits dans les journaux |
| Calcul des frais de port et des taxes par pays | Règle unique et forfaitaire, signalée comme telle |
| Avis clients, liste de souhaits, codes de réduction | Sans rapport avec la démonstration visée |

Ces exclusions sont réversibles. J'isole le paiement et l'envoi d'e-mails derrière des interfaces pour qu'un vrai prestataire puisse être branché sans toucher au reste (décision consignée dans l'ADR 0009).

## Contraintes et hypothèses

| Type | Énoncé | Conséquence |
| --- | --- | --- |
| Contrainte | Framework fixé dès le départ : Next.js, décision que j'ai prise avant l'étude | Dans l'étude technique, je vérifie qu'il tient face aux exigences et je documente ses contreparties plutôt que de rouvrir le choix |
| Contrainte | Exécution locale uniquement | Pas de CDN ni de données de terrain : les performances se mesurent en laboratoire |
| Contrainte | Je travaille seul | Pas de relecture par un tiers : je compense par l'outillage et par une relecture à froid |
| Contrainte | J'écris les commits, les issues et les pull requests en anglais, la documentation en français | Règle posée dans `CONTRIBUTING.md` |
| Hypothèse | Le catalogue reste petit (quelques dizaines de références) | Pas de moteur de recherche dédié ni de pagination complexe |
| Hypothèse | Aucune donnée personnelle réelle n'est saisie | Les exigences de protection des données sont appliquées comme en production, sans obligation légale effective |
| Hypothèse | L'échéance est proche mais non bloquante | Je dimensionne le périmètre *Must* pour quatre sprints courts ; les *Should* et *Could* me servent de marge |

## Parcours clés

Je construis les tests de bout en bout et l'audit final sur ces trois parcours.

1. **Découvrir et choisir.** Accueil → boutique → filtre « Huiles d'olive » → fiche « Fruité vert » → format 75 cl → ajout au panier.
2. **Commander.** Panier → création de compte → adresse → récapitulatif → paiement simulé accepté → confirmation.
3. **Revenir.** Connexion → historique → détail d'une commande → déconnexion.

Chaque parcours existe dans les deux langues et doit être réalisable au clavier seul.
