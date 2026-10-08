# Sprint 2 — Panier et comptes : revue et rétrospective

- Date de clôture : 8 octobre 2026
- Objectif du sprint : un client remplit un panier et possède un compte
- Résultat : **objectif atteint**, avec un écart de performance qui s'étend à la fiche produit (LCP)

## Revue

### Démonstration

Sur le build de production lancé par `docker compose --profile demo up --build --wait`, j'ai déroulé le parcours suivant en 1440 px puis en 390 px de large : ajout d'un produit au panier sans compte, inscription, enregistrement de l'adresse de livraison, panier retrouvé après l'inscription, déconnexion (l'appareil n'a plus de panier), reconnexion (le panier revient), suppression du compte refusée avec un mauvais mot de passe puis acceptée avec le bon.

J'ai regardé le rendu de la page du compte et de la page de confirmation aux deux largeurs, en plus des tests. La commande et le paiement appartiennent au sprint 3.

### Ce que j'ai livré

| Issue | Pull request | Livrable | Preuve |
| --- | --- | --- | --- |
| [#21](https://github.com/Benbecker69/zolive_fluide/issues/21) | [#64](https://github.com/Benbecker69/zolive_fluide/pull/64) | Panier persistant : ajout, quantité, suppression, compteur dans l'en-tête | Stock vérifié avant toute écriture ; la base refuse une quantité hors de 1 à 12 |
| [#22](https://github.com/Benbecker69/zolive_fluide/issues/22) | [#65](https://github.com/Benbecker69/zolive_fluide/pull/65) | Inscription, connexion, déconnexion | Condensat Argon2id inspecté en base ; attributs du cookie de session inspectés |
| [#23](https://github.com/Benbecker69/zolive_fluide/issues/23) | [#66](https://github.com/Benbecker69/zolive_fluide/pull/66) | Limitation des tentatives par compte, journal de sécurité | Tests avec une horloge déplacée à la main ; aucun mot de passe, adresse ou jeton dans le journal |
| [#24](https://github.com/Benbecker69/zolive_fluide/issues/24) | [#67](https://github.com/Benbecker69/zolive_fluide/pull/67) | Profil et adresse de livraison, retour à la page demandée après connexion | Aucune fonction du profil ne prend d'identifiant d'utilisateur |
| [#25](https://github.com/Benbecker69/zolive_fluide/issues/25) | [#68](https://github.com/Benbecker69/zolive_fluide/pull/68) | Le panier invité rejoint le compte à la connexion | Plafond par le stock, panier d'un autre compte ignoré, deux connexions simultanées |
| [#26](https://github.com/Benbecker69/zolive_fluide/issues/26) | [#69](https://github.com/Benbecker69/zolive_fluide/pull/69) | Suppression du compte et des données personnelles | Tests sur de vraies sessions ; mot de passe vide refusé ; cascade vérifiée en base |

### En chiffres

| Indicateur | Valeur | À la fin du sprint 1 |
| --- | --- | --- |
| Points prévus | 30 | 35 |
| Points terminés | 30 | 35 |
| Issues terminées | 6, les 6 prévues | 10 |
| Tests unitaires et d'outillage | 123 | 75 |
| Tests d'intégration, sur PostgreSQL | 93 | 28 |
| Tests de bout en bout et d'accessibilité | 92 | 47 |
| Migrations SQL ajoutées | 5 (`0001` à `0005`) | 1 |
| Décisions d'architecture ajoutées | 1 ([0014](../../adr/0014-sign-in-throttling.md)) | 3 |
| Risques ajoutés au registre | 5 (R-19 à R-23) | 4 |
| Critères d'acceptation déplacés en cours de sprint | **0** | 5 |

**Vélocité mesurée : 30 points**, soit une moyenne de 32,5 sur deux sprints. La réserve du sprint 1 tient toujours : j'ai ouvert et clos ce sprint le même jour. Je garde ce chiffre comme plafond de planification.

### Mesures de qualité

| Exigence | Cible | Mesure | Statut |
| --- | --- | --- | --- |
| SEC-01, autorisation au plus près de la donnée | Session et propriété vérifiées dans la couche d'accès | Tests d'accès croisé entre deux clients, sans session, avec le panier d'un autre compte | Conforme |
| SEC-04, stockage des mots de passe | Argon2id, 19 Mio, 2 itérations, parallélisme 1 | Condensat lu en base : `$argon2id$v=19$m=19456,t=2,p=1$` | Conforme |
| SEC-05, limitation des tentatives | Blocage après des tentatives répétées | Blocage au cinquième échec en 15 minutes, y compris avec le bon mot de passe | Conforme |
| SEC-06, sessions | En base, révocables, cookie protégé | `HttpOnly`, `Secure`, `SameSite=Lax` lus dans le navigateur ; session supprimée à la déconnexion | Conforme |
| SEC-11, journalisation de sécurité | Aucune donnée sensible | Tests : ni mot de passe, ni adresse e-mail, ni jeton dans le journal | Conforme |
| SEC-10, vulnérabilités hautes ou critiques | 0 | 1, sans correctif publié, acceptée et justifiée (R-16) ; inchangé | Écart accepté |
| A11Y-08, violations sérieuses ou critiques | 0 | 0 sur le panier, la connexion, l'inscription et le compte, dans les deux langues, et sur la confirmation de suppression | Conforme |
| LEG-05, traceurs | Uniquement des cookies exemptés | Session, panier et langue ; aucun outil de mesure | Partiel : la page d'information arrive avec [#31](https://github.com/Benbecker69/zolive_fluide/issues/31) |
| LEG-06, minimisation | Données nécessaires seulement ; compte supprimable | Ni téléphone ni date de naissance ; suppression livrée | Conforme |
| PERF-04, score Lighthouse | ≥ 90 | Accueil 95, fiche produit 96 | Conforme |
| PERF-02, CLS | ≤ 0,1 | 0 sur les deux pages | Conforme |
| PERF-01, LCP, accueil | ≤ 2,5 s | 2,88 s (médiane de 2,89, 2,87, 2,88) | **Non conforme** |
| PERF-01, LCP, fiche produit | ≤ 2,5 s | 2,85 s (médiane de 2,85, 2,44, 2,87) | **Non conforme** |

Mesures de performance faites avec Lighthouse 13.5.0 en émulation mobile, sur le build de production, page déjà en cache. La fiche produit est mesurée pour la première fois. La page boutique ne l'est pas encore ; les pages du panier et du compte, propres à chaque visiteur, ne sont pas visées par ces cibles.

### Ce que le sprint a fait apparaître

| Constat | Ce que j'en ai fait |
| --- | --- |
| Le limiteur de débit de la bibliothèque d'authentification ne couvre pas les appels faits depuis le serveur, et identifie l'appelant par un en-tête que je n'ai pas sans *reverse proxy*. L'ADR 0004 supposait le contraire | Nouvelle décision plutôt qu'un changement silencieux : limitation par compte, compteurs en base ([ADR 0014](../../adr/0014-sign-in-throttling.md)) |
| Cette limitation permet de bloquer le compte de quelqu'un dont on connaît l'adresse | Contrepartie écrite et assumée (R-20) |
| La parade du risque R-19 affirmait une protection qui n'existait pas | Texte corrigé dans la même pull request que la limitation |
| La bibliothèque ne vérifie le mot de passe d'une suppression de compte que s'il est fourni, et accepte sinon une session récente seule | Ma fonction refuse un mot de passe vide avant de l'appeler ; un test d'intégration verrouille ce refus |
| Le cookie du panier dure 30 jours, la session 7 : après l'expiration d'une session, l'appareil lit encore le panier du compte | Risque R-21, et note sur l'issue de la commande ([#27](https://github.com/Benbecker69/zolive_fluide/issues/27)) |
| Les paniers d'invités ne sont jamais purgés | Risque R-22 |
| La fiche produit dépasse elle aussi la cible de LCP : c'était le signal d'alerte du risque R-18 | Registre mis à jour, mesures ajoutées à l'issue [#60](https://github.com/Benbecker69/zolive_fluide/issues/60) |
| Deux façons d'être « connecté » coexistent dans les tests d'intégration : session remplacée pour le profil, vraie session pour la suppression | Issue [#71](https://github.com/Benbecker69/zolive_fluide/issues/71) |
| L'adresse du site dans la configuration doit être celle que le visiteur tape | Tests de bout en bout alignés sur `localhost` |

### Ajustements de périmètre

Aucun critère n'a bougé en cours de sprint.

Pendant la planification, j'ai déplacé un critère de l'issue #26 vers l'issue [#29](https://github.com/Benbecker69/zolive_fluide/issues/29) : « les commandes passées sont conservées sans identifiant personnel ». Les commandes n'existent pas avant le sprint 3, le critère n'était donc pas démontrable. L'issue #29 porte une note sur le texte de la page du compte à compléter à ce moment-là.

J'ai ouvert une issue pendant le sprint, sans la traiter : [#71](https://github.com/Benbecker69/zolive_fluide/issues/71), une dette de tests placée au sprint 4.

## Rétrospective

### Résultat de l'action du sprint 1

> Avant de prendre une issue, je vérifie que chacun de ses critères est démontrable avec ce qui existe déjà sur `main`.

Objectif : zéro critère déplacé en cours de sprint. **Résultat : zéro**, contre cinq au sprint 1. Le seul déplacement a eu lieu à la planification. Je garde ce contrôle dans la *Definition of Ready*.

### Ce qui a bien fonctionné

- **Les *Must* d'abord.** Les deux *Should* n'ont démarré qu'une fois les quatre *Must* fusionnés.
- **L'autorisation par construction.** Les fonctions du profil et de la suppression reçoivent la requête, jamais un identifiant : il n'y a rien à falsifier, et un test le vérifie.
- **Lire la bibliothèque avant de m'y fier.** Deux fois, son comportement réel différait de ce que j'attendais ; deux fois, je l'ai vu avant la fusion.
- **Écrire les limites plutôt que les taire.** L'inscription qui révèle l'existence d'un compte, le blocage d'un compte par un tiers, l'absence de mot de passe oublié sont dans les pull requests et dans le registre des risques.
- **Tester sur de vraies sessions.** Pour la suppression du compte, le cookie de session est reconstruit et signé comme le fait la bibliothèque : le test traverse le vrai contrôle.

### Ce qui a moins bien fonctionné

- **Une hypothèse non vérifiée dans une décision.** L'ADR 0004 comptait sur le limiteur de débit de la bibliothèque sans que j'aie lu comment il fonctionne. Je l'ai découvert en ouvrant l'issue, pas en écrivant la décision.
- **Mes estimations, encore.** La limitation des tentatives, estimée à 3 points, a demandé une décision d'architecture, une table et un mécanisme complet ; le profil, estimé à 5, a été plus simple.
- **Le LCP n'a pas avancé.** L'écart touche maintenant deux pages et sa cause reste inconnue.
- **L'action du sprint 0 n'est toujours pas faite.** Je n'ai pas lu les textes officiels, alors que la suppression du compte touche déjà à la conservation des données. C'est un préalable à l'issue des pages légales.
- **Des tests d'intégration incohérents entre eux.** J'ai trouvé la bonne façon d'obtenir une session à la dernière issue, sans reprendre les tests du profil.

### Action d'amélioration pour le sprint 3

> **Avant de faire reposer une exigence de sécurité sur le comportement d'une bibliothèque, je lis la documentation ou le code du point d'entrée que j'appelle, et j'écris le test qui verrouille ce comportement.**

J'ajoute ce contrôle à la liste de relecture de mon propre diff. À la rétrospective du sprint 3, je compterai les hypothèses de ce type découvertes fausses après la fusion : l'objectif est zéro.

## Suite

Le sprint 3 (commande) contient 29 points, tous *Must* : il n'a aucune marge à sacrifier si la vélocité baisse. Avant de le planifier, je lis les textes officiels attendus depuis le sprint 0. Je fixerai l'ordre des issues à la planification avec la règle des critères démontrables : le récapitulatif de commande de l'issue [#27](https://github.com/Benbecker69/zolive_fluide/issues/27) renvoie vers les conditions de vente, que l'issue [#31](https://github.com/Benbecker69/zolive_fluide/issues/31) publie.
