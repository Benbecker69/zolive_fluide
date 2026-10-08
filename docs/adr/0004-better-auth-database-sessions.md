# 0004 — Better Auth, sessions en base, Argon2id

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : SEC-01, SEC-04, SEC-05, SEC-06, SEC-11

## Contexte et problème

Les clients créent un compte, se connectent et consultent leurs commandes. Je dois choisir comment authentifier, comment stocker les mots de passe et comment tenir les sessions.

## Facteurs de décision

- La documentation de Next.js recommande une bibliothèque plutôt qu'une solution maison.
- Stockage des mots de passe conforme aux recommandations de l'OWASP et de la CNIL.
- Sessions révocables.
- Limitation des tentatives de connexion.

## Options envisagées

1. Écrire l'authentification moi-même.
2. Auth.js (NextAuth).
3. Better Auth.
4. Un service d'authentification hébergé.

## Décision

Je retiens **Better Auth**, avec quatre réglages.

| Réglage | Valeur | Raison |
| --- | --- | --- |
| Méthode | E-mail et mot de passe uniquement | Périmètre ; pas de fournisseur tiers à configurer |
| Hachage | Argon2id, 19 Mio de mémoire, 2 itérations, parallélisme 1 | Premier choix de l'OWASP ; Better Auth utilise scrypt par défaut, que l'OWASP ne recommande que si Argon2id est indisponible |
| Sessions | Stockées en base ; cookie `HttpOnly`, `Secure`, `SameSite=Lax` | Révocables à la déconnexion ; options de cookie recommandées par Next.js |
| Limitation des tentatives | Activée, compteurs stockés en base | Le stockage par défaut, en mémoire, ne survit pas à un redémarrage du conteneur |

Politique de mot de passe : au moins 12 caractères. Je me place dans le cas « mot de passe avec restriction d'accès » de la recommandation de la CNIL, qui demande au moins 50 bits d'entropie à condition de limiter les tentatives ; aucun renouvellement périodique n'est imposé.

J'écarte l'option 1 : la documentation de Next.js souligne elle-même qu'une implémentation sûre devient vite complexe. J'écarte l'option 2 : Auth.js est désormais maintenu par l'équipe de Better Auth, qui recommande Better Auth pour les nouveaux projets. J'écarte l'option 4 : le site doit tourner en local sans dépendre d'un service extérieur.

## Conséquences

- Positif : inscription, connexion, sessions et limitation des tentatives sont fournies et testées par d'autres ; je n'écris que la configuration.
- Négatif : une dépendance centrale pour la sécurité ; une faille dans la bibliothèque me touche directement. Je la suis avec Dependabot.
- Négatif : remplacer la fonction de hachage est une personnalisation que je dois tester moi-même.
- La session n'est qu'une preuve d'identité : l'autorisation reste vérifiée dans la couche `data/` (ADR 0002).

## Confirmation

- Test unitaire sur les paramètres d'Argon2id ; un condensat en base commence par `$argon2id$`.
- Test de bout en bout : blocage temporaire après des tentatives répétées.
- Test : le cookie de session est refusé après déconnexion.

## Références

[Étude technique](../audit/03-etude-technique.md), section « Authentification » ; [exigences de sécurité](../audit/02-exigences-qualite.md), SEC-04 à SEC-06.
