# Politique de sécurité

## Signaler une vulnérabilité

Ne pas ouvrir d'issue publique. Utiliser le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**.

Merci d'indiquer :

- le composant et la version (ou le commit) concernés ;
- les étapes de reproduction ;
- l'impact estimé.

Un accusé de réception est envoyé sous sept jours. La correction est publiée avec un avis de sécurité une fois le correctif fusionné.

## Versions suivies

Seule la branche `main` reçoit des correctifs. Le projet est une démonstration exécutée en local : il ne traite aucune donnée réelle et aucun paiement réel.

## Règles appliquées dans ce dépôt

- Aucun secret dans le code ni dans l'historique ; la configuration passe par des variables d'environnement.
- Les actions GitHub tierces sont épinglées sur un SHA de commit complet et mises à jour par Dependabot.
- Les exigences de sécurité du produit et leur méthode de vérification sont décrites dans l'audit de cadrage (`docs/audit/`).
