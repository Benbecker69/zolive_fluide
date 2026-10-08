# 0013 — Générer les pages du catalogue à la demande, puis les servir depuis le cache

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : PERF-01 à PERF-04, OPS-03, MAINT-07
- Précise : la « stratégie de rendu » de l'[architecture cible](../project/architecture.md)

## Contexte et problème

L'architecture cible prévoyait des pages de catalogue « statiques ». En arrivant à la fiche produit, première page à la fois mise en cache et alimentée par la base, j'ai dû préciser ce que « statique » veut dire ici.

Une page statique au sens strict est générée pendant le build. Or mon build se fait dans une image Docker, sans base de données : l'ADR 0010 veut une image construite une fois et lancée partout, et la base n'existe qu'au démarrage du profil. Générer les fiches au build exigerait donc une base joignable pendant la construction de l'image.

## Facteurs de décision

- Le build ne doit dépendre d'aucun service extérieur.
- Les pages du catalogue doivent être servies sans requête en base à chaque visite.
- Un changement de catalogue ou de stock doit finir par apparaître, sans reconstruire l'image.

## Options envisagées

1. Générer les pages au build, avec une base accessible pendant la construction de l'image.
2. Rendre les pages à chaque requête.
3. Générer chaque page à sa première visite, la mettre en cache, et la régénérer en arrière-plan au plus une fois par minute.

## Décision

Je retiens l'option 3 pour la fiche produit et la page d'accueil. Chaque page déclare une liste de chemins vide à générer au build et une durée de validité de 60 secondes : Next.js la produit à la première demande, la sert ensuite depuis son cache et la rafraîchit en arrière-plan quand elle a plus d'une minute.

La liste de la boutique reste rendue à chaque requête : son contenu dépend des paramètres de l'URL (filtre et tri).

J'écarte l'option 1 : elle couple la construction de l'image à l'état d'une base, et l'image ne serait plus la même selon le catalogue du moment. J'écarte l'option 2 : chaque visite d'une fiche coûterait des requêtes en base pour un contenu qui change rarement.

## Conséquences

- Positif : l'image se construit sans base ; les pages du catalogue sont servies depuis le cache dès la deuxième visite.
- Négatif : la toute première visite d'une page paie son rendu. Je le mesurerai à l'audit final.
- Négatif : une fiche peut afficher un stock vieux d'une minute. Ce n'est qu'un affichage : le stock réel est vérifié dans la transaction qui crée la commande (SEC-07).
- Le cache est local à l'instance, ce qui convient à une instance unique (risque déjà accepté dans le registre).

## Confirmation

- Le build de l'image réussit sans base de données : c'est le cas à chaque exécution du job `container`.
- `e2e/product.spec.ts` vérifie qu'une fiche déjà visitée est servie depuis le cache.
- Les mesures de PERF-01 à PERF-04 seront faites sur des pages déjà en cache et, séparément, sur une première visite.
