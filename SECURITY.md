# Politique de sécurité

## Signaler une vulnérabilité

Ne pas ouvrir d'issue publique. Utiliser le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**.

Merci d'indiquer :

- le composant et la version (ou le commit) concernés ;
- les étapes de reproduction ;
- l'impact estimé.

J'accuse réception sous sept jours. Je publie la correction avec un avis de sécurité une fois le correctif fusionné.

## Versions suivies

Je ne corrige que la branche `main`. Le projet est une démonstration exécutée en local : il ne traite aucune donnée réelle et aucun paiement réel.

## Règles que j'applique dans ce dépôt

- Aucun secret dans le code ni dans l'historique ; la configuration passe par des variables d'environnement.
- J'épingle les actions GitHub tierces sur un SHA de commit complet ; Dependabot me propose leurs mises à jour.
- Je décris les exigences de sécurité du produit et leur méthode de vérification dans l'[audit de cadrage](docs/audit/02-exigences-qualite.md).
