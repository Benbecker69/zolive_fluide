# 0010 — Exécution locale avec Docker Compose

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-07, OPS-01 à OPS-06, SEC-08

## Contexte et problème

Le site n'est pas mis en ligne : il doit se lancer sur n'importe quel poste, le mien comme celui d'un évaluateur, avec le même résultat. Il dépend d'une base PostgreSQL.

## Facteurs de décision

- Une commande pour tout lancer.
- Le même environnement en développement, en test et en démonstration.
- Aucun secret dans le dépôt.

## Options envisagées

1. Demander d'installer Node.js et PostgreSQL sur le poste.
2. Docker Compose pour la base seulement, l'application lancée à la main.
3. Docker Compose pour l'application et la base.

## Décision

Je retiens l'option 3, avec deux profils.

| Profil | Contenu | Usage |
| --- | --- | --- |
| Développement | PostgreSQL en conteneur ; l'application lancée par `pnpm dev` sur le poste, pour le rechargement à chaud | Au quotidien |
| Démonstration | PostgreSQL et l'application, celle-ci construite en mode production | Recette, tests de bout en bout, audit final, évaluation |

Règles associées :

- l'image de l'application est construite en plusieurs étapes et s'exécute avec un utilisateur non privilégié ;
- la base n'est joignable que depuis le réseau interne des conteneurs en profil démonstration ;
- toute la configuration vient de variables d'environnement, validées au démarrage : s'il en manque une, l'application refuse de démarrer et dit laquelle ;
- un fichier `.env.example` documente chaque variable ; les fichiers `.env` réels sont ignorés par Git ;
- les migrations et le jeu de données se lancent par des commandes dédiées ;
- la version de Node.js est déclarée à un seul endroit, lu par Docker et par la CI.

J'écarte l'option 1 : les versions divergeraient d'un poste à l'autre. L'option 2 est en fait mon profil de développement ; seule, elle ne permettrait pas de mesurer un build de production reproductible.

## Conséquences

- Positif : l'évaluateur n'a besoin que de Docker ; les mesures de l'audit portent sur le même artefact que la démonstration.
- Négatif : pas de *reverse proxy* ni de TLS en local. La documentation de Next.js recommande un *reverse proxy* devant un serveur exposé à Internet : c'est un prérequis que je note pour toute mise en ligne.
- Négatif : le cookie `Secure` exige HTTPS ; en local, je m'appuie sur l'exception que les navigateurs accordent à `localhost`. Je le vérifierai dès le sprint 2.

## Confirmation

- La CI construit l'image et lance le profil démonstration pour les tests de bout en bout.
- Test d'installation sur un poste vierge, chronométré, à l'audit final.

## Références

[Exigences d'exploitabilité](../audit/02-exigences-qualite.md) ; [registre des risques](../audit/04-risques.md), section « Risques acceptés ».
