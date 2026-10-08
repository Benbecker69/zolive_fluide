# 0009 — Paiement simulé derrière une interface

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : SEC-07, MAINT-04, LEG-07

## Contexte et problème

J'ai exclu le paiement réel du périmètre. Le tunnel de commande doit pourtant aller jusqu'au bout, échecs compris, et je ne veux pas que ce choix de périmètre se retrouve éparpillé dans le code de la commande.

## Facteurs de décision

- Pouvoir brancher un vrai prestataire plus tard sans réécrire la commande.
- Pouvoir tester les cas d'échec de manière déterministe.
- Ne jamais manipuler de vraies données de carte.

## Options envisagées

1. Passer la commande à « payée » directement, sans notion de paiement.
2. Intégrer un prestataire en mode test.
3. Définir une interface de paiement et lui fournir un adaptateur simulé.

## Décision

Je retiens l'option 3. La commande dépend d'une interface, `PaymentProvider`, qui expose une seule opération : demander le paiement d'un montant pour une commande, et recevoir un résultat accepté ou refusé avec un motif.

L'adaptateur simulé décide du résultat à partir d'un scénario choisi sur l'écran de paiement : paiement accepté, paiement refusé, erreur technique. L'écran affiche clairement qu'il s'agit d'une simulation et ne demande aucun numéro de carte.

Règles associées :

- le montant est calculé par le serveur à partir de la commande, jamais reçu du navigateur ;
- la commande passe par des états explicites : en attente de paiement, payée, échouée ; une commande échouée libère le stock ;
- la même approche s'applique à l'envoi d'e-mails : une interface `Mailer`, et un adaptateur qui écrit le message dans les journaux.

J'écarte l'option 1 : elle supprime les cas d'échec, qui sont précisément ce qu'un tunnel de commande doit savoir gérer. J'écarte l'option 2 : elle demande un compte et des clés chez un tiers, pour un site qui doit tourner en local sans dépendance extérieure.

## Conséquences

- Positif : les trois scénarios se testent sans réseau ; brancher un prestataire réel reviendra à écrire un adaptateur.
- Négatif : un vrai prestataire apporte des notifications asynchrones et une authentification forte que mon interface ne modélise pas. Elle devra évoluer à ce moment-là, et je le note pour ne pas laisser croire qu'elle est complète.

## Confirmation

- Tests d'intégration : un scénario refusé laisse le stock intact et la commande à l'état « échouée ».
- Test de substitution : la commande fonctionne avec un second adaptateur de test, sans modification de son code.

## Références

[Contexte et périmètre](../audit/01-contexte-et-perimetre.md), section « Hors périmètre de cette version ».
