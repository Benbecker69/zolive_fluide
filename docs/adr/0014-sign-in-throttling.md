# 0014 — Limiter les tentatives de connexion par compte, dans la couche d'accès aux données

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : SEC-05, SEC-11
- Remplace : la ligne « Limitation des tentatives » de l'[ADR 0004](0004-better-auth-database-sessions.md)

## Contexte et problème

L'ADR 0004 confiait la limitation des tentatives au limiteur intégré de Better Auth, avec des compteurs en base. En arrivant à cette issue, j'ai relu sa documentation avant de le configurer, et deux phrases changent la donne :

- « Les requêtes côté serveur faites avec `auth.api` ne sont pas concernées par la limitation. Elles ne s'appliquent qu'aux requêtes émises par le client. »
- le limiteur identifie l'appelant par son adresse IP, lue par défaut dans l'en-tête `x-forwarded-for`.

Or j'ai choisi, à l'issue précédente, de n'appeler la bibliothèque que depuis le serveur, par des actions serveur, sans monter ses points d'entrée HTTP. Et mon exécution locale n'a pas de *reverse proxy* : aucun en-tête ne porte l'adresse du visiteur. Le limiteur intégré ne s'applique donc pas à mes connexions, et ne pourrait de toute façon identifier personne.

## Facteurs de décision

- La CNIL n'admet un mot de passe de 50 bits d'entropie qu'accompagné d'une limitation des tentatives : sans elle, mon exigence SEC-05 n'est pas tenue.
- Les compteurs doivent survivre à un redémarrage.
- La mesure ne doit pas révéler quelles adresses e-mail ont un compte.
- Je ne dispose d'aucune adresse IP fiable.

## Options envisagées

1. Monter les points d'entrée HTTP de la bibliothèque et passer par son client, pour bénéficier de son limiteur.
2. Limiter par adresse IP dans mes actions serveur.
3. Limiter par compte, dans la couche d'accès aux données, avec des compteurs en base.

## Décision

Je retiens l'option 3.

| Règle | Valeur |
| --- | --- |
| Échecs tolérés | 5 en 15 minutes |
| Effet | Connexion refusée pendant 15 minutes, quel que soit le mot de passe |
| Remise à zéro | À la première connexion réussie, ou quand les échecs ont plus de 15 minutes |
| Identifiant du compte | Empreinte SHA-256 tronquée de l'adresse saisie, jamais l'adresse |
| Adresse sans compte | Même comportement : le blocage ne révèle rien |

Ces seuils sont les miens. Ils restent en deçà du blocage après dix échecs que la CNIL cite parmi les mécanismes possibles.

L'enregistrement d'un échec tient en une seule instruction SQL : deux échecs simultanés ne peuvent pas passer tous les deux sous la limite. Pendant un blocage, le mot de passe n'est même pas vérifié.

J'écarte l'option 1 : elle rouvrirait toute une API d'authentification publique, et son limiteur resterait aveugle sans en-tête d'adresse. J'écarte l'option 2 pour la même raison : je n'ai pas d'adresse IP à laquelle me fier.

## Conséquences

- Positif : la limitation fonctionne sans infrastructure, se teste avec une horloge injectée, et survit à un redémarrage.
- Négatif : **quelqu'un qui connaît une adresse e-mail peut bloquer la connexion de son titulaire pendant 15 minutes** en échouant cinq fois. C'est la contrepartie connue d'un blocage par compte. Je l'accepte parce que le blocage est court et se lève seul ; une limitation par adresse IP devant le serveur la réduirait.
- Négatif : rien ne limite les tentatives qui visent beaucoup de comptes à la fois, ni les inscriptions en série. Les deux demandent une limitation par adresse IP, donc un *reverse proxy*, déjà listé comme prérequis d'une mise en ligne.
- J'écris moi-même du code de sécurité, ce que l'ADR 0004 voulait éviter. Je le garde petit, isolé dans un module, et couvert par des tests qui portent sur chaque règle du tableau.

## Confirmation

- `tests/integration/sign-in-throttle.test.ts` : une règle du tableau, un test, avec une horloge déplacée à la main.
- `e2e/sign-in-throttle.spec.ts` : le blocage vu depuis le navigateur, pour un compte existant et pour une adresse sans compte.
- Le même fichier de tests d'intégration vérifie que le journal de sécurité ne contient ni mot de passe, ni adresse e-mail, ni jeton de session.

## Références

Documentation de Better Auth, page *Rate limit*, consultée le 8 octobre 2026 [S53] ; recommandation de la CNIL sur les mots de passe [S22]. Les identifiants renvoient à la [bibliographie de l'audit](../audit/sources.md).
