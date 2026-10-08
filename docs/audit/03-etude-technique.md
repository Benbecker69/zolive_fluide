# 03 — Étude technique

Pour chaque brique, je compare les options crédibles aux exigences du [document 02](02-exigences-qualite.md). Je conclus par la pile que je retiens et par ce que chaque choix me coûte.

## Méthode de comparaison

J'évalue chaque brique sur cinq critères, toujours dans le même ordre.

| Critère | Question posée | Preuve acceptée |
| --- | --- | --- |
| Adéquation | La technologie couvre-t-elle le besoin sans contournement ? | Documentation officielle |
| Sécurité | Quel est son historique, et que faut-il faire pour l'utiliser sûrement ? | Avis de sécurité, guides officiels |
| Pérennité | Est-elle maintenue, avec une politique de support claire ? | Politique de support, versions publiées |
| Adoption | Trouvera-t-on de l'aide, des exemples, des intégrations ? | Téléchargements npm, enquêtes d'usage |
| Coût d'entrée | Qu'ajoute-t-elle en complexité et en outillage ? | Documentation, essai |

**Avertissement sur les chiffres d'adoption.** Les téléchargements npm comptent les installations, y compris celles des serveurs d'intégration continue : ils indiquent un ordre de grandeur, pas un nombre d'utilisateurs. Les enquêtes reposent sur des répondants volontaires. Je n'utilise aucun de ces chiffres comme argument unique.

Les versions et les téléchargements cités viennent du registre npm, que j'ai interrogé le 8 octobre 2026 (`npm view <paquet> version` et API `api.npmjs.org/downloads/point/last-week`, semaine du 28 septembre au 4 octobre 2026) [S41].

## Décision préalable : construire ou assembler

Un commerçant réel comparerait d'abord une solution hébergée ou un logiciel de boutique libre à un développement sur mesure. Je ne mène pas cette comparaison : l'objet de mon projet est de démontrer la conduite d'un développement, ce qui impose de développer. C'est une **contrainte pédagogique**, pas une conclusion technique, et je la consigne comme telle pour qu'elle ne soit pas prise pour une recommandation.

## Framework d'application

**Next.js est mon point de départ** : j'ai arrêté ce choix avant l'étude. Je ne le rouvre pas ; en revanche je vérifie qu'il tient face aux exigences et je documente honnêtement ses contreparties.

### Ce que disent les données

| Indicateur | Next.js | Astro | Nuxt | SvelteKit | Source |
| --- | --- | --- | --- | --- | --- |
| Téléchargements hebdomadaires npm | 76,9 M | 7,9 M | 2,8 M | 3,6 M | [S41] |
| Usage déclaré, enquête Stack Overflow 2025 | 20,8 % | 4,5 % | non relevé | non relevé | [S39] |
| Version stable | 16.4.0 | — | — | — | [S41] |

L'enquête State of JavaScript 2025 apporte la nuance indispensable : Next.js « continue de gagner du terrain et de dominer la catégorie », mais « perd en satisfaction dans le même temps » ; l'écart de satisfaction avec Astro, premier du classement, atteint 39 points, et la « complexité excessive » fait partie des griefs relevés par l'enquête (303 mentions) [S40].

### Analyse

| Critère | Constat | Source |
| --- | --- | --- |
| Adéquation | Le périmètre mêle des pages de catalogue publiques et des parcours authentifiés et transactionnels (panier, commande, compte). Next.js couvre les deux dans une seule application : rendu serveur, pages statiques, actions serveur, routage internationalisé par sous-chemin | [S32], [S35] |
| Sécurité | Deux vulnérabilités critiques en 2025 : contournement du *middleware* (CVE-2025-29927) et exécution de code à distance dans les React Server Components (CVE-2025-55182, CVSS 10,0). Le framework publie des guides précis sur la manière de structurer une application sûre | [S36], [S37], [S31] |
| Pérennité | Politique de support publiée : la version 16 est en *Active LTS*, la 15 en maintenance pour deux ans après sa sortie | [S30] |
| Adoption | Premier méta-framework par les téléchargements et par l'usage déclaré | [S41], [S39] |
| Coût d'entrée | Élevé : modèle mental serveur/client, règles de cache, satisfaction en baisse | [S40] |

### Verdict

Next.js répond au besoin et son écosystème est le plus fourni. Ses deux faiblesses sont réelles ; je les traite au lieu de les ignorer :

- **Sécurité** : exigences SEC-01 (autorisation dans la couche d'accès aux données, jamais dans le seul *proxy*) et SEC-13 (rester sur la branche supportée, correctif sous sept jours).
- **Complexité** : un seul mode d'accès aux données dans tout le projet, comme le recommande la documentation (« choisir une approche et éviter de les mélanger ») [S31] ; conventions écrites dans les ADR.

Astro aurait été un candidat sérieux pour un site essentiellement éditorial, au vu de son niveau de satisfaction [S40]. Je ne l'évalue pas plus avant, le framework étant fixé.

## Langage et environnement d'exécution

| Brique | Choix | Justification | Source |
| --- | --- | --- | --- |
| Langage | TypeScript **6.0.x** (6.0.3) | Le typage statique sert MAINT-03. La version 7.0.2 est la plus récente sur npm, mais `typescript-eslint` 8.71.1 déclare ne supporter que `>=4.8.4 <6.1.0` : la version 7 priverait le projet de son analyse statique. J'épingle donc la 6.0 et je suis la montée de version comme un risque | [S41] |
| Exécution | Node.js **24** (LTS « Krypton ») | Seule branche en phase *Active LTS* au 8 octobre 2026 (la 22 est déjà en maintenance) : elle passe elle-même en maintenance le 20 octobre 2026 et reste supportée jusqu'au 30 avril 2028. La version 26 ne devient LTS que le 28 octobre 2026. Compatible avec Next.js 16.4 (`>=20.9.0`), Vitest 5 (`>=22.12.0`) et Playwright (22, 24 ou 26) | [S38], [S41], [S50], [S51] |
| Gestionnaire de paquets | pnpm | Déjà installé sur mon poste (11.15.1) ; fichier de verrouillage versionné (OPS-04). Je fige sa version dans `package.json` | — |

## Base de données et accès aux données

### Base de données : PostgreSQL

PostgreSQL est la base la plus utilisée par les répondants de l'enquête Stack Overflow 2025 (55,6 %, devant MySQL à 40,5 % et SQLite à 37,5 %) [S39]. Le besoin est relationnel et transactionnel : une commande doit décrémenter un stock et figer des prix de manière atomique (SEC-07). Je retiens PostgreSQL 18, image officielle `postgres:18-alpine`.

### ORM : Drizzle ORM plutôt que Prisma

C'est le choix sur lequel j'ai le plus hésité ; je le fonde sur des constats datés.

| Critère | Drizzle ORM 0.45.3 | Prisma |
| --- | --- | --- |
| État des versions au 8 octobre 2026 | Version stable 0.45.3 ; une version 1.0 est en bêta | L'étiquette `latest` du registre pointe sur **8.0.0-rc.21**, une version candidate ; la dernière version stable, 7.10.0, est sous l'étiquette `prev` |
| Documentation | Décrit la version publiée | La page de démarrage des migrations décrit déjà les commandes de la version 8 (`migration plan`, `db migrate`), différentes de celles de la version 7 (`migrate dev`, `migrate deploy`) |
| Compatibilité avec Better Auth 1.7.7 | Déclarée : `drizzle-orm ^0.45.2` | Déclarée pour les versions 5, 6 et 7 uniquement : **la version 8 n'est pas supportée** |
| Migrations | Fichiers SQL générés, lisibles en relecture | Format en cours de changement entre les versions 7 et 8 |
| Téléchargements hebdomadaires | 31,2 M | 22,0 M (`prisma`), 21,2 M (`@prisma/client`) |

Sources : registre npm [S41], documentation de Prisma [S44], [S52].

**Ma lecture.** Démarrer sur Prisma aujourd'hui, c'est choisir entre une version candidate non supportée par la bibliothèque d'authentification, et une version 7 dont la documentation par défaut et le système de migrations sont déjà en train d'être remplacés. Dans les deux cas, une migration majeure est programmée dès le premier jour.

**Contrepartie que j'assume.** Drizzle est en version 0.x. Semantic Versioning est explicite : en version majeure zéro, « tout peut changer à tout moment » et l'API publique ne doit pas être considérée comme stable [S05]. Mes parades :

- j'épingle la version exacte et je relis une par une les mises à jour proposées par Dependabot ;
- l'ORM n'est importé que dans la couche d'accès aux données (MAINT-01) : un changement d'API reste confiné à un seul dossier ;
- les migrations étant du SQL, elles survivent à un changement d'outil.

La comparaison publiée par Prisma reproche à Drizzle un typage incomplet des requêtes ; cette source se déclare elle-même partiale (« Yes, we are biased ») [S44]. Je ne retiens donc pas l'argument seul, mais il me pousse à écrire des tests d'intégration sur chaque requête de la couche d'accès aux données.

## Authentification

La documentation de Next.js recommande d'utiliser une bibliothèque d'authentification plutôt qu'une solution maison, « pour plus de sécurité et de simplicité » [S32].

| Critère | Better Auth 1.7.7 | Auth.js / NextAuth 4.24.15 | Solution maison |
| --- | --- | --- | --- |
| Statut | Actif, licence MIT | Maintenu par l'équipe de Better Auth depuis le 22 septembre 2025 : correctifs de sécurité assurés, et cette équipe « recommande fortement aux nouveaux projets de démarrer avec Better Auth » | — |
| E-mail et mot de passe | Intégré ; longueur de 8 à 128 caractères par défaut ; fonction de hachage remplaçable | — | Tout à écrire |
| Limitation des tentatives | Intégrée, activée par défaut en production ; 3 requêtes par 10 secondes sur la connexion par e-mail | — | Tout à écrire |
| Sessions | En base de données | — | Tout à écrire |
| Téléchargements hebdomadaires | 12,6 M | 7,8 M | — |

Sources : [S42], [S43], [S53], [S54], [S41].

**Je retiens Better Auth**, avec deux réglages que mes exigences imposent.

1. **Hachage.** Better Auth utilise scrypt par défaut [S54]. L'OWASP place Argon2id en premier choix et scrypt en second, « quand Argon2id n'est pas disponible » [S20]. Argon2id étant disponible sous Node.js, je remplace la fonction de hachage pour satisfaire SEC-04.
2. **Stockage de la limitation des tentatives.** Le stockage par défaut est en mémoire [S53] : je le déplace en base pour qu'il survive à un redémarrage du conteneur.

J'écarte la solution maison : la documentation de Next.js elle-même souligne qu'une implémentation sûre « devient vite complexe » [S32].

## Internationalisation

Next.js fournit le routage par langue et un mécanisme de dictionnaires, mais pas le formatage des nombres et des dates ni la gestion des pluriels ; sa documentation renvoie vers des bibliothèques, dont `next-intl` en premier dans la liste [S35].

**Je retiens next-intl 4.14.9.** La bibliothèque couvre traductions, formatage et routage internationalisé, fonctionne avec l'App Router et les composants serveur [S45], déclare la compatibilité avec Next.js 16 et compte 7,9 M de téléchargements hebdomadaires [S41]. Elle répond directement à I18N-01 à I18N-04.

## Interface et styles

**Je retiens Tailwind CSS 4.3.3.** Dans la version 4, les jetons de design sont des variables de thème déclarées avec la directive `@theme` ; chacune produit à la fois des classes utilitaires et une variable CSS standard [S48]. Les jetons de la [maquette](../../design/README.md) se transcrivent donc un pour un, ce qui sert MAINT-02 : une couleur hors palette n'a pas de classe. Adoption : 163 M de téléchargements hebdomadaires [S41].

Je n'ajoute aucune bibliothèque de composants : ma charte ne comporte qu'une dizaine de composants, tous spécifiques. Pour les comportements délicats en accessibilité (boîte de dialogue du panier, menus), je m'appuie d'abord sur les éléments HTML natifs.

## Validation des données

**Je retiens Zod 4.6.5.** C'est la bibliothèque utilisée dans les exemples officiels de Next.js pour valider les formulaires côté serveur [S32]. Un même schéma sert à valider l'entrée et à en déduire le type TypeScript, ce qui évite la divergence entre les deux (SEC-03, MAINT-03).

## Tests

Ma stratégie suit la pyramide des tests : des tests de granularités différentes, et d'autant moins nombreux qu'ils sont de haut niveau [S15].

| Niveau | Outil | Périmètre | Indicateurs |
| --- | --- | --- | --- |
| Unitaire et intégration | Vitest 5.0.3 | Règles métier (panier, prix, commande), schémas de validation, couche d'accès aux données sur une base PostgreSQL réelle | 142 M de téléchargements hebdomadaires, contre 56,8 M pour Jest [S41] ; exige Node.js ≥ 22.12 [S50] |
| Bout en bout | Playwright 1.64.0 | Les trois parcours clés, dans les deux langues, au clavier | Chromium, WebKit et Firefox [S51] ; 86,2 M de téléchargements, contre 7,4 M pour Cypress [S41] |
| Accessibilité | `@axe-core/playwright` 4.13.0 | Pages clés, à chaque exécution des tests de bout en bout | A11Y-08 |
| Performance | Lighthouse CI (`@lhci/cli` 0.15.1) | Accueil, boutique, fiche produit | PERF-01 à PERF-04 |

Je fais tourner les tests d'intégration contre PostgreSQL et non contre une base simulée : c'est la parité des environnements demandée par OPS-03.

## Qualité du code et outillage

| Besoin | Outil | Exigence servie |
| --- | --- | --- |
| Analyse statique | ESLint 10 avec `typescript-eslint` 8.71.1 et `eslint-config-next` 16.4.0 | MAINT-01, MAINT-03 |
| Mise en forme | Prettier 3.9.9 | Lisibilité des diffs |
| Code et dépendances inutilisés | Knip 6.40.0 | MAINT-04 |
| Vulnérabilités des dépendances | `pnpm audit`, Dependabot, CodeQL | SEC-10 |
| Secrets | Détection de secrets et protection à la poussée de GitHub, gratuites sur les dépôts publics | [S46] |

## Exécution et intégration continue

**Docker Compose** assemble l'application et PostgreSQL. L'image de l'application est construite en plusieurs étapes et s'exécute avec un utilisateur non privilégié. La base n'est pas exposée hors du réseau interne des conteneurs (SEC-08).

La documentation d'auto-hébergement de Next.js recommande de placer un *reverse proxy* devant le serveur lorsqu'il est exposé à Internet [S34]. Mon site n'étant pas exposé, je n'ajoute pas de *proxy* ; je consigne le point dans le registre des risques pour une éventuelle mise en ligne.

**GitHub Actions** exécute à chaque pull request : lint, typage, tests unitaires et d'intégration, build, tests de bout en bout, accessibilité, budget de performance. Les actions tierces sont épinglées par SHA (SEC-10).

## Pile retenue

| Couche | Technologie | Version au 8 octobre 2026 | Décision |
| --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.4.0 | ADR 0002 |
| Interface | React | 19.3.0 | ADR 0002 |
| Langage | TypeScript | 6.0.3 | ADR 0002 |
| Exécution | Node.js | 24 LTS | ADR 0002 |
| Base de données | PostgreSQL | 18 | ADR 0003 |
| ORM | Drizzle ORM | 0.45.3 | ADR 0003 |
| Authentification | Better Auth | 1.7.7 | ADR 0004 |
| Internationalisation | next-intl | 4.14.9 | ADR 0005 |
| Styles | Tailwind CSS | 4.3.3 | ADR 0006 |
| Validation | Zod | 4.6.5 | ADR 0002 |
| Tests | Vitest, Playwright, axe-core | 5.0.3, 1.64.0, 4.13.0 | ADR 0007 |
| Exécution locale | Docker Compose | — | ADR 0010 |

Ces versions sont un constat daté, pas un engagement : ma première tâche du sprint 1 sera de les revérifier et de consigner tout écart.

## Ce que cette pile ne fait pas bien

Un choix sans contrepartie est un choix que je n'ai pas étudié. Voici celles que je connais et que j'accepte.

| Contrepartie | Effet | Réponse |
| --- | --- | --- |
| Next.js est complexe et sa satisfaction baisse [S40] | Risque d'erreurs de cache et de frontière serveur/client | Conventions écrites, un seul mode d'accès aux données, tests de bout en bout |
| Historique de failles critiques côté serveur [S36], [S37] | Exposition élevée en cas de retard de mise à jour | SEC-01, SEC-13 |
| Drizzle en version 0.x [S05] | Ruptures d'API possibles | Version épinglée, ORM confiné à une couche |
| TypeScript épinglé une version majeure en arrière | Dette de mise à jour | Suivi dans le registre des risques |
| CSP stricte incompatible avec les pages statiques [S33] | Arbitrage sécurité/performance | SEC-09 |
