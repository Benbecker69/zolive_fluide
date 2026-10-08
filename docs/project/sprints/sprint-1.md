# Sprint 1 — Fondations et catalogue : revue et rétrospective

- Date de clôture : 8 octobre 2026
- Objectif du sprint : un visiteur parcourt le catalogue en français et en anglais
- Résultat : **objectif atteint**, avec un écart de performance consigné (LCP de la page d'accueil)

## Revue

### Démonstration

Sur le build de production lancé par `docker compose --profile demo up --build --wait`, j'ai déroulé le premier parcours clé de l'audit, dans les deux langues : accueil, boutique, filtre « Huiles d'olive », fiche « Fruité vert », format 75 cl. Le prix, le prix au litre et le total suivent la sélection. L'ajout au panier appartient au sprint 2.

### Ce que j'ai livré

| Issue | Pull request | Livrable | Preuve |
| --- | --- | --- | --- |
| [#12](https://github.com/Benbecker69/zolive_fluide/issues/12) | [#49](https://github.com/Benbecker69/zolive_fluide/pull/49) | Squelette Next.js, TypeScript strict, règle de couches | Tests qui échouent si une frontière n'est plus vérifiée |
| [#14](https://github.com/Benbecker69/zolive_fluide/issues/14) | [#50](https://github.com/Benbecker69/zolive_fluide/pull/50) | Pipeline applicatif, audit des dépendances, analyse statique | Vérifications requises sur `main` |
| [#13](https://github.com/Benbecker69/zolive_fluide/issues/13) | [#52](https://github.com/Benbecker69/zolive_fluide/pull/52) | Docker Compose, configuration validée au démarrage, point de santé | Test de fumée en sept points, rejoué par la CI |
| [#53](https://github.com/Benbecker69/zolive_fluide/issues/53) | [#54](https://github.com/Benbecker69/zolive_fluide/pull/54) | Types de Node.js maintenus sur la version du runtime | Proposition de mise à jour refermée, avec sa raison |
| [#15](https://github.com/Benbecker69/zolive_fluide/issues/15) | [#55](https://github.com/Benbecker69/zolive_fluide/pull/55) | Jetons de design, composants, charte vivante | axe-core, parcours clavier, aucune requête tierce |
| [#16](https://github.com/Benbecker69/zolive_fluide/issues/16) | [#56](https://github.com/Benbecker69/zolive_fluide/pull/56) | Français et anglais, sélecteur de langue | Redirection selon la langue du navigateur, 404 localisée |
| [#17](https://github.com/Benbecker69/zolive_fluide/issues/17) | [#57](https://github.com/Benbecker69/zolive_fluide/pull/57) | Schéma du catalogue, migration SQL, jeu de données | Contraintes refusées par la base, testées sur PostgreSQL |
| [#19](https://github.com/Benbecker69/zolive_fluide/issues/19) | [#58](https://github.com/Benbecker69/zolive_fluide/pull/58) | Boutique : filtre et tri portés par l'URL | Fonctionne sans JavaScript |
| [#20](https://github.com/Benbecker69/zolive_fluide/issues/20) | [#59](https://github.com/Benbecker69/zolive_fluide/pull/59) | Fiche produit : formats, quantité, profil de dégustation | Format épuisé désactivé, 404 pour un produit inconnu |
| [#18](https://github.com/Benbecker69/zolive_fluide/issues/18) | [#61](https://github.com/Benbecker69/zolive_fluide/pull/61) | Page d'accueil | Mesures Lighthouse, dont une sous la cible |

### En chiffres

| Indicateur | Valeur |
| --- | --- |
| Points prévus | 35 |
| Points terminés | 35 |
| Issues terminées | 10 : les 9 prévues et 1 ouverte en cours de sprint |
| Tests unitaires et d'outillage | 75 |
| Tests d'intégration, sur PostgreSQL | 28 |
| Tests de bout en bout et d'accessibilité | 47 |
| Vérifications requises pour fusionner dans `main` | 8 |
| Décisions d'architecture ajoutées | 3 ([0011](../../adr/0011-pin-eslint-9.md), [0012](../../adr/0012-i18n-cross-cutting-layer.md), [0013](../../adr/0013-on-demand-static-pages.md)) |
| Risques ajoutés au registre | 4 (R-15 à R-18) |

**Vélocité mesurée : 35 points.** Je la prends avec prudence. J'ai ouvert et clos ce sprint le même jour, sans consommer la semaine prévue, et plusieurs issues estimées à 3 points m'ont demandé nettement plus d'effort que d'autres estimées à 5. Le chiffre me sert de plafond pour planifier le sprint 2, pas de promesse.

### Mesures de qualité

| Exigence | Cible | Mesure | Statut |
| --- | --- | --- | --- |
| PERF-04, score Lighthouse, accueil | ≥ 90 | 95 (médiane de 95, 97, 95) | Conforme |
| PERF-02, CLS, accueil | ≤ 0,1 | 0 | Conforme |
| PERF-01, LCP, accueil | ≤ 2,5 s | 2,74 s (médiane de 2,74, 2,42, 2,74) | **Non conforme** |
| PERF-06, requêtes tierces | 0 | 0 | Conforme |
| A11Y-08, violations sérieuses ou critiques | 0 | 0 sur l'accueil, la boutique et la fiche produit, dans les deux langues | Conforme |
| A11Y-03, contour des contrôles | ≥ 3:1 | 3,61:1 | Conforme |
| SEC-10, vulnérabilités hautes ou critiques | 0 | 1, sans correctif publié, acceptée et justifiée (R-16) | Écart accepté |

Mesures faites avec Lighthouse 13.5.0 en émulation mobile, sur le build de production, page déjà en cache. Les pages boutique et fiche produit n'ont pas encore été mesurées : c'est prévu dans l'issue [#60](https://github.com/Benbecker69/zolive_fluide/issues/60).

### Ce que le sprint a fait apparaître

| Constat | Ce que j'en ai fait |
| --- | --- |
| Trois greffons de lint de Next.js ne déclarent pas la compatibilité avec ESLint 10 | ESLint épinglé en 9 ([ADR 0011](../../adr/0011-pin-eslint-9.md)) |
| Dès sa première exécution, l'audit des dépendances a trouvé une vulnérabilité haute, dont le correctif est annoncé mais pas publié | Exception explicite et justifiée plutôt que seuil abaissé (R-16) |
| Un lien standard fait perdre la langue courante au visiteur | L'internationalisation devient une couche transverse, le lien standard est interdit par le linter ([ADR 0012](../../adr/0012-i18n-cross-cutting-layer.md)) |
| L'image Docker se construit sans base : des pages « statiques » ne peuvent pas être générées au build | Génération à la première visite, puis cache ([ADR 0013](../../adr/0013-on-demand-static-pages.md)) |
| Le port 3000 était déjà pris sur mon poste | Port publié configurable |
| L'outil de détection de code mort a signalé sept icônes écrites « pour plus tard » | Supprimées ; une icône s'ajoute quand un composant s'en sert |
| Une règle de lint mal échappée ne signalait plus rien | Détectée par les tests de la règle elle-même, avant fusion |
| Le LCP de l'accueil dépasse la cible en émulation mobile | Chiffre consigné tel quel, deux pistes mesurées et écartées, issue #60, risque R-18 |

### Ajustements de périmètre

J'ai déplacé cinq critères d'acceptation en cours de sprint, chaque fois avec une note dans les issues concernées.

| Critère | De | Vers | Raison |
| --- | --- | --- | --- |
| Tests d'intégration sur PostgreSQL dans le pipeline | #14 | #17 | Aucun code de base de données avant #17 |
| Commandes de migration et de chargement | #13 | #17 | Le schéma n'existait pas encore |
| Formatage des prix selon la langue | #16 | #19 | Aucun prix affiché avant la boutique |
| Formatage des dates selon la langue | #16 | #30 | Aucune date affichée avant l'historique des commandes |
| LCP d'au plus 2,5 s sur l'accueil | #18 | #60 | Cible non atteinte, cause non identifiée |

J'ai aussi changé l'ordre de réalisation : boutique, fiche produit, puis accueil, pour qu'aucune page fusionnée ne renvoie vers une page inexistante.

## Rétrospective

### Ce qui a bien fonctionné

- **Monter l'outillage avant la première fonctionnalité.** Les incompatibilités de versions sont apparues sur un squelette vide, où elles ne coûtaient rien.
- **Tester les règles elles-mêmes.** Les frontières de couches, les couleurs littérales et les textes en dur ont chacun un test qui échoue si la règle cesse de s'appliquer. C'est ce qui a rattrapé la règle mal échappée.
- **Tester contre le build de production.** Les tests de bout en bout tournent sur l'image Docker, pas sur le serveur de développement : ce que je montre est ce que je teste.
- **Regarder le rendu, pas seulement les tests.** Une capture a montré un sélecteur de quantité étiré sur toute la largeur, que tous les tests laissaient passer.
- **Mesurer avant d'affirmer.** Sans la mesure Lighthouse, j'aurais déclaré la page d'accueil conforme.

### Ce qui a moins bien fonctionné

- **Mes estimations.** Le schéma du catalogue et Docker Compose, estimés à 3 points, ont chacun demandé plus que la boutique, estimée à 5.
- **Cinq critères placés dans la mauvaise issue.** À la rédaction du backlog, je n'avais pas vérifié que chaque critère était démontrable avec ce qui existerait au moment de prendre l'issue.
- **Le LCP reste inexpliqué.** J'ai borné l'investigation à deux essais ; je sais ce qui ne marche pas, pas encore pourquoi.
- **L'action du sprint 0 n'est pas faite.** La lecture des textes officiels reste à faire avant l'issue des pages légales, au sprint 3.

### Action d'amélioration pour le sprint 2

> **Avant de prendre une issue, je vérifie que chacun de ses critères est démontrable avec ce qui existe déjà sur `main`. Sinon, je le déplace pendant la planification du sprint, pas en cours de route.**

J'ajoute ce contrôle à la *Definition of Ready* et je compterai, à la rétrospective du sprint 2, le nombre de critères déplacés en cours de sprint : l'objectif est zéro.

## Suite

Le sprint 2 (panier et comptes) contient 24 points *Must* et 6 points *Should*, sous la vélocité mesurée. Je commence par l'issue [#21](https://github.com/Benbecker69/zolive_fluide/issues/21), le panier.
