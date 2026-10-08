# 04 — Registre des risques

Un risque est un événement incertain qui, s'il survient, nuit à un objectif du projet. Je suis le propriétaire de chacun. À chaque risque, j'associe une parade préventive et un signal d'alerte qui déclenche mon plan de repli.

**Échelles.** Je note la probabilité et l'impact de 1 (faible) à 3 (fort). La criticité est leur produit : de 1 à 2, je surveille le risque ; de 3 à 4, je m'impose une parade ; de 6 à 9, je le traite avant de démarrer le lot concerné.

Je relis le registre à chaque fin de sprint. Un risque clos reste dans le tableau, avec sa date de clôture.

## Risques techniques

| Id | Risque | P | I | Crit. | Prévention | Signal d'alerte | Repli |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Nouvelle vulnérabilité critique dans Next.js ou React, comme en mars et en décembre 2025 [S36], [S37] | 2 | 3 | 6 | Branche *Active LTS* [S30] ; Dependabot ; autorisation dans la couche d'accès aux données et non dans le seul *proxy* (SEC-01) | Avis de sécurité GitHub ou billet de sécurité de Next.js | Mise à jour sous sept jours, par une pull request dédiée et prioritaire (SEC-13) |
| R-02 | Rupture d'API de Drizzle ORM, en version 0.x [S05] | 2 | 2 | 4 | Version exacte épinglée ; ORM confiné à la couche d'accès aux données (MAINT-01) ; migrations en SQL | Mise à jour Dependabot qui casse le typage ou les tests | Rester sur la version épinglée ; migrer vers la 1.0 dans un lot dédié une fois stable |
| R-03 | Incompatibilité entre versions majeures récentes (Next.js 16.4, React 19.3, ESLint 10, Tailwind 4, Vitest 5) | 2 | 2 | 4 | Première issue du sprint 1 : squelette minimal avec toute la chaîne d'outils, avant toute fonctionnalité | Échec d'installation ou de build sur le squelette | Reculer d'une version mineure la brique fautive et le consigner dans l'ADR concerné |
| R-04 | TypeScript épinglé en 6.0 parce que `typescript-eslint` ne supporte pas la 7 [S41] | 3 | 1 | 3 | Épinglage explicite et documenté | Publication d'un `typescript-eslint` compatible | Monter de version dans une pull request dédiée |
| R-05 | Node.js 26 devient LTS le 28 octobre 2026, pendant le projet [S38] | 3 | 1 | 3 | Version de Node.js déclarée à un seul endroit et utilisée par Docker et la CI | Passage effectif en LTS | Rester en 24, supporté jusqu'en avril 2028 ; la montée de version n'est pas dans le périmètre |
| R-06 | La CSP stricte par zone se révèle infaisable ou dégrade le score de performance [S33] | 2 | 2 | 4 | Investigation bornée dans le temps en sprint 4, avant de généraliser | Score Lighthouse sous 90 après activation | Appliquer la CSP sans *nonce* à tout le site et documenter l'écart de sécurité |
| R-07 | Régression d'accessibilité introduite par un composant interactif | 2 | 2 | 4 | axe-core en CI dès le premier composant ; éléments HTML natifs en priorité | Violation « sérieuse » ou « critique » en CI | La pull request n'est pas fusionnée |
| R-08 | Fuite d'un secret dans le dépôt public | 1 | 3 | 3 | Fichiers `.env` ignorés ; détection de secrets et protection à la poussée activées [S46] | Alerte GitHub | Révoquer le secret, puis réécrire l'historique |
| R-09 | Les tests de bout en bout deviennent instables et sont ignorés | 2 | 2 | 4 | Jeu de données déterministe ; base réinitialisée avant chaque exécution ; sélecteurs par rôle | Un test échoue de manière intermittente | Corriger ou mettre en quarantaine sous 24 h, avec une issue ; jamais de relance « pour voir » |
| R-15 | ESLint épinglé en version 9, marquée dépréciée sur npm, parce que trois greffons d'`eslint-config-next` ne déclarent pas la version 10 [S41] | 3 | 1 | 3 | Épinglage explicite (ADR 0011) ; tests qui prouvent que les règles de couches sont actives | Publication d'un `eslint-config-next` dont tous les greffons déclarent ESLint 10 | Monter de version dans une pull request dédiée |

## Risques de projet

| Id | Risque | P | I | Crit. | Prévention | Signal d'alerte | Repli |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-10 | Dérive du périmètre : les *Should* et *Could* consomment le temps des *Must* | 2 | 3 | 6 | Priorité MoSCoW sur chaque issue ; un *Should* ne démarre que si les *Must* du sprint sont terminés | Un *Must* glisse d'un sprint au suivant | Retirer les *Could*, puis les *Should*, du sprint en cours |
| R-11 | Pas de relecteur tiers : une erreur de conception passe inaperçue | 3 | 2 | 6 | Relecture à froid sur le diff avec la liste du modèle de PR ; contrôles automatisés ; ADR écrits avant le code | Défaut découvert après fusion | Issue de type *bug*, analyse de la cause dans la rétrospective |
| R-12 | Je n'ai pas encore la grille d'évaluation détaillée ; un livrable attendu pourrait manquer | 2 | 3 | 6 | Je la demande au formateur ; en attendant, j'aligne les livrables sur les compétences usuelles d'un lead développeur | Réception de la grille | Tracer chaque critère vers un livrable, compléter les manques dans un lot dédié |
| R-13 | Sous-estimation : les quatre sprints ne suffisent pas | 2 | 2 | 4 | Estimation en points ; vélocité mesurée dès le sprint 1 et utilisée pour replanifier | Vélocité du sprint 1 inférieure de plus d'un quart à la prévision | Réduire le périmètre aux *Must* ; le sprint 4 (durcissement et audit) n'est jamais sacrifié |
| R-14 | Une source citée devient inaccessible | 2 | 1 | 2 | Vérification hebdomadaire automatique des liens externes | Échec du contrôle programmé | Remplacer par une source équivalente ou une archive, mettre à jour la bibliographie |

## Risques acceptés

Je connais ces risques et je n'engage aucune action, parce qu'ils sortent du périmètre de cette version.

| Risque | Pourquoi il est accepté |
| --- | --- |
| Pas de *reverse proxy* devant le serveur, contrairement à la recommandation pour un serveur exposé [S34] | Le site n'est pas exposé à Internet. À traiter impérativement avant toute mise en ligne |
| Le cache de Next.js est local à l'instance [S34] | Une seule instance tourne. À revoir en cas de déploiement à plusieurs instances |
| Les pages légales contiennent des emplacements non remplis | Seul un commerçant réel peut les fournir |
| Je n'ai pas vérifié les exemptions légales d'accessibilité sur les textes officiels | J'applique le niveau AA de toute façon |
