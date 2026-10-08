# 02 — Exigences de qualité

Je donne à chaque exigence un identifiant, une cible vérifiable, une méthode de mesure et la source qui la fonde. Je reprends ces identifiants dans les issues, dans la *Definition of Done* et dans le [plan de l'audit final](05-plan-audit-final.md).

Mon découpage suit le modèle de qualité produit ISO/IEC 25010, qui distingue notamment l'efficacité de performance, la sécurité, la capacité d'interaction (dont l'inclusivité), la maintenabilité et la flexibilité [S16].

Lecture des sources : `[Sxx]` renvoie à la [bibliographie](sources.md). Une cible marquée **seuil personnel** n'est pas tirée d'un référentiel : c'est un seuil que je me fixe et que je calibrerai sur les premières mesures.

## 1. Performance

### Pourquoi

Google définit trois signaux d'expérience utilisateur, les Core Web Vitals, et un seuil « bon » pour chacun, à évaluer au 75ᵉ centile des chargements, mobile et ordinateur séparément [S17].

### Contrainte de mesure

Ces seuils s'appliquent à des données de terrain. Le site tournant en local, je n'aurai pas d'utilisateurs réels : je mesurerai en laboratoire avec Lighthouse, sur un build de production. Lighthouse ne mesure pas l'INP, qui exige une interaction réelle ; je prends le temps de blocage total (TBT) comme indicateur de substitution, c'est d'ailleurs la métrique la plus pondérée du score [S18].

### Exigences

| Id | Exigence | Cible | Mesure | Source |
| --- | --- | --- | --- | --- |
| PERF-01 | Affichage du plus grand élément visible (LCP) | ≤ 2,5 s | Lighthouse, émulation mobile, pages accueil, boutique, fiche produit | [S17] |
| PERF-02 | Stabilité visuelle (CLS) | ≤ 0,1 | Idem | [S17] |
| PERF-03 | Réactivité (INP) | ≤ 200 ms | Non mesurable en laboratoire : suivie par le TBT de Lighthouse et vérifiée à la main sur les interactions du panier | [S17], [S18] |
| PERF-04 | Score Lighthouse Performance | ≥ 90 (plage « bon » : 90 à 100) | Lighthouse CI sur le build de production, médiane de trois passes | [S18] |
| PERF-05 | Poids du JavaScript chargé au premier affichage des pages du catalogue | Budget que je fixe sur le squelette en sprint 1, puis que je verrouille en CI (**seuil personnel**) | Rapport de build, échec de la CI en cas de dépassement | — |
| PERF-06 | Aucune ressource tierce bloquante | Zéro requête vers un domaine tiers au chargement ; polices servies par l'application | Onglet réseau, audit Lighthouse | — |

Pondération du score Lighthouse (version 10) : TBT 30 %, LCP 25 %, CLS 25 %, FCP 10 %, Speed Index 10 % [S18]. J'ordonne mes efforts d'optimisation selon ces poids.

### Arbitrage à connaître

Une politique de sécurité du contenu (CSP) stricte à base de *nonces* impose le rendu dynamique de toutes les pages : la génération statique et sa mise en cache sont alors désactivées, ce que la documentation de Next.js présente explicitement comme un coût de performance [S33]. Je tranche entre CSP à *nonces* et pages statiques dans la section Sécurité (SEC-09).

## 2. Sécurité

### Référentiels

- **OWASP Top 10:2025** pour la cartographie des risques applicatifs [S19].
- **OWASP ASVS 5.0.0** comme liste de contrôle détaillée lors de l'audit final [S21].
- **OWASP Password Storage Cheat Sheet** et **recommandation CNIL sur les mots de passe** pour l'authentification [S20], [S22].
- **Guides de sécurité de Next.js** pour les spécificités du framework [S31], [S32], [S33].

### Couverture de l'OWASP Top 10:2025

| Catégorie [S19] | Risque concret pour Zolive | Parade prévue |
| --- | --- | --- |
| A01 Broken Access Control | Un client lit la commande d'un autre en changeant un identifiant dans l'URL | Autorisation vérifiée dans la couche d'accès aux données, à chaque lecture et à chaque mutation (SEC-01, SEC-02) |
| A02 Security Misconfiguration | En-têtes absents, messages d'erreur bavards, service de base de données exposé | En-têtes de sécurité, configuration validée au démarrage, base non exposée hors du réseau Docker (SEC-08, SEC-09, SEC-12) |
| A03 Software Supply Chain Failures | Dépendance compromise ou vulnérable | Fichier de verrouillage, mises à jour automatisées, actions épinglées par SHA, analyse des dépendances (SEC-10) |
| A04 Cryptographic Failures | Mots de passe mal protégés, cookie de session lisible | Argon2id, cookies `HttpOnly`, `Secure`, `SameSite` (SEC-04, SEC-06) |
| A05 Injection | Injection SQL, script injecté dans une page | Requêtes paramétrées par l'ORM, échappement par défaut de React, validation des entrées (SEC-03) |
| A06 Insecure Design | Prix ou total envoyés par le navigateur et acceptés tels quels | Prix, stock et totaux recalculés côté serveur dans une transaction (SEC-07) |
| A07 Authentication Failures | Attaque par force brute, mots de passe faibles | Limitation des tentatives, politique de mot de passe CNIL (SEC-05) |
| A08 Software or Data Integrity Failures | Code non revu poussé sur `main` | Branche protégée, pull request et CI obligatoires |
| A09 Security Logging & Alerting Failures | Tentatives d'intrusion invisibles | Journal structuré des événements de sécurité (SEC-11) |
| A10 Mishandling of Exceptional Conditions | Erreur non gérée qui expose une trace ou laisse une commande à moitié créée | Gestion centralisée des erreurs, transactions, pages d'erreur neutres (SEC-12) |

### Exigences

| Id | Exigence | Cible | Mesure | Source |
| --- | --- | --- | --- | --- |
| SEC-01 | Autorisation au plus près de la donnée | Toute fonction d'accès aux données d'un client vérifie la session et la propriété de la ressource. Le contrôle de route (*proxy*) ne sert qu'aux redirections | Tests d'intégration : accès croisé entre deux comptes refusé ; revue des modules `use server` | [S31], [S32] |
| SEC-02 | Actions serveur traitées comme des points d'entrée publics | Authentification, autorisation et validation refaites dans chaque action ; valeurs de retour limitées au nécessaire | Revue de code avec la liste d'audit de Next.js | [S31] |
| SEC-03 | Validation de toutes les entrées côté serveur | Schéma de validation sur chaque formulaire, paramètre d'URL et paramètre de recherche | Tests unitaires des schémas ; aucune lecture directe d'une entrée non validée | [S31], [S32] |
| SEC-04 | Stockage des mots de passe | Argon2id, au minimum 19 Mio de mémoire, 2 itérations, parallélisme 1 | Test unitaire sur les paramètres ; inspection d'un condensat en base | [S20] |
| SEC-05 | Politique de mot de passe et limitation des tentatives | Entropie d'au moins 50 bits **avec** limitation des tentatives (cas « accès restreint » de la CNIL, qui cite le commerce en ligne) ; pas de renouvellement périodique imposé | Tests sur le formulaire ; test de blocage après tentatives répétées | [S22] |
| SEC-06 | Sessions | Sessions stockées en base, révocables ; cookie `HttpOnly`, `Secure`, `SameSite=Lax`, durée limitée | Inspection du cookie ; test de révocation à la déconnexion | [S32] |
| SEC-07 | Intégrité de la commande | Le serveur ne fait confiance à aucun prix, total ou stock venant du client ; création de commande atomique | Test d'intégration avec une requête falsifiée ; test de concurrence sur le dernier article en stock | [S19] (A06) |
| SEC-08 | En-têtes de sécurité | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'` | Test automatisé sur les en-têtes de réponse | [S33] |
| SEC-09 | Politique de sécurité du contenu | Voir l'arbitrage ci-dessous | Rapport de violations en test de bout en bout | [S33] |
| SEC-10 | Chaîne d'approvisionnement | Fichier de verrouillage versionné ; Dependabot actif ; aucune vulnérabilité haute ou critique connue à la livraison ; analyse statique du code | `pnpm audit` en CI ; alertes GitHub à zéro ; CodeQL | [S19] (A03), [S46] |
| SEC-11 | Journalisation de sécurité | Connexions réussies et échouées, refus d'autorisation et erreurs serveur journalisés sans donnée sensible | Test : un mot de passe ou un jeton n'apparaît jamais dans les journaux | [S19] (A09) |
| SEC-12 | Gestion des erreurs | Aucune trace technique visible par l'utilisateur ; erreurs inattendues journalisées avec un identifiant de corrélation | Test de bout en bout sur une erreur provoquée | [S19] (A10) |
| SEC-13 | Version du framework | Rester sur la branche *Active LTS* de Next.js ; correctif de sécurité appliqué sous sept jours | Vérification à chaque sprint ; Dependabot | [S30] |

### Pourquoi je ne transige pas sur SEC-01 et SEC-13

Deux incidents récents de l'écosystème justifient ces exigences.

- **CVE-2025-29927 (mars 2025).** Un en-tête interne permettait de contourner entièrement le *middleware* de Next.js ; les applications auto-hébergées étaient touchées [S37]. Une autorisation placée uniquement dans le *middleware* tombait donc d'un coup. La documentation actuelle le dit sans détour : le *proxy* ne doit pas être la seule ligne de défense, et l'essentiel des contrôles doit se faire au plus près de la source de données [S32].
- **CVE-2025-55182 (décembre 2025).** Exécution de code à distance sans authentification dans les React Server Components, notée 10,0 sur l'échelle CVSS ; Next.js faisait partie des frameworks touchés et d'autres failles ont été corrigées dans la foulée [S36].

J'en tire deux règles : la sécurité ne peut pas reposer sur une seule couche du framework, et la capacité à appliquer vite un correctif est une exigence à part entière.

### Arbitrage SEC-09 : CSP stricte ou pages statiques

| Option | Sécurité | Performance | Statut dans Next.js 16 |
| --- | --- | --- | --- |
| CSP à *nonces* | Stricte, sans `'unsafe-inline'` | Rendu dynamique de toutes les pages, pas de cache statique | Documentée et stable [S33] |
| CSP sans *nonce* | Autorise `'unsafe-inline'` pour les scripts | Pages statiques conservées | Documentée et stable [S33] |
| CSP par empreintes (SRI) | Stricte | Pages statiques conservées | Expérimentale [S33] |

**Ma décision de cadrage :** je garde les pages publiques du catalogue statiques, avec une CSP sans *nonce* ; les pages authentifiées et le tunnel de commande, de toute façon rendus dynamiquement, reçoivent la CSP stricte à *nonces*. J'écarte l'option SRI tant qu'elle est expérimentale. Je confirmerai la faisabilité de cette répartition par zone par une courte investigation en sprint 4 ; si elle échoue, j'appliquerai la CSP sans *nonce* à tout le site pour conserver les pages statiques (PERF-04), et je documenterai l'écart de sécurité qui en résulte.

## 3. Accessibilité

### Référentiels et cadre légal

- **WCAG 2.2**, recommandation du W3C du 12 décembre 2024, trois niveaux de conformité A, AA, AAA [S24].
- **RGAA 4.1.2**, référentiel français en vigueur ; une version 5 est annoncée pour fin 2026 [S25]. La norme européenne de référence est l'EN 301 549 V2.1.2, fondée sur les WCAG 2.1 niveaux A et AA [S25].
- **Acte européen sur l'accessibilité** : le commerce en ligne figure parmi les services couverts [S26].

**Limite de vérification.** Je n'ai lu les seuils d'exemption de la directive (UE) 2019/882 pour les microentreprises, et le détail de sa transposition française (loi n° 2023-171, décret n° 2023-931), que dans des sources secondaires ; je n'ai pas relu les textes officiels eux-mêmes. Je ne les reprends donc pas ici. Le point est sans effet sur le projet, qui est fictif et non publié : **je retiens le niveau AA comme exigence de qualité, indépendamment de toute obligation**.

### Exigences

| Id | Exigence | Cible | Mesure | Source |
| --- | --- | --- | --- | --- |
| A11Y-01 | Niveau de conformité | WCAG 2.2 niveau AA sur toutes les pages | Audit final : contrôles automatiques et manuels | [S24] |
| A11Y-02 | Contraste du texte | ≥ 4,5:1 (3:1 pour le texte de grande taille) | Déjà vérifié sur la palette : voir [la fiche de la maquette](../../design/README.md) | [S24] (1.4.3) |
| A11Y-03 | Contraste des contours de contrôles | ≥ 3:1 ; corrige l'écart relevé sur la maquette (1,23:1) | Calcul sur les jetons ; contrôle automatique | [S24] (1.4.11) |
| A11Y-04 | Navigation au clavier | Les trois parcours clés réalisables sans souris, focus toujours visible, ordre logique | Test de bout en bout au clavier ; contrôle manuel | [S24] |
| A11Y-05 | Structure et noms accessibles | Un `h1` par page, hiérarchie de titres cohérente, régions nommées, nom accessible sur chaque contrôle | axe-core en CI sur les pages clés | [S24] |
| A11Y-06 | Formulaires | Étiquette liée à chaque champ, erreurs décrites en texte et rattachées au champ | Tests de composants ; contrôle au lecteur d'écran | [S24] |
| A11Y-07 | Langue | Attribut `lang` conforme à la langue affichée | Test automatisé sur les deux langues | [S24] |
| A11Y-08 | Zéro violation automatique | Aucune violation axe-core de niveau « sérieux » ou « critique » | Échec de la CI sinon | — |

Les outils automatiques ne couvrent pas tous les critères : A11Y-08 est une condition nécessaire, pas une preuve de conformité. Je prévois donc, dans l'audit final, des contrôles manuels (clavier, lecteur d'écran, zoom à 200 %, largeur de 320 px).

## 4. Maintenabilité

### Référentiel

ISO/IEC 25010 décompose la maintenabilité en cinq sous-caractéristiques : modularité, réutilisabilité, analysabilité, modifiabilité, testabilité [S16]. Je traduis chacune en une règle vérifiable par l'outillage.

| Id | Sous-caractéristique | Exigence | Mesure |
| --- | --- | --- | --- |
| MAINT-01 | Modularité | Dépendances à sens unique entre couches : interface → cas d'usage → accès aux données. La base de données et les variables d'environnement ne sont importées que dans la couche d'accès aux données | Règle de lint sur les imports ; échec de la CI |
| MAINT-02 | Réutilisabilité | Composants d'interface construits sur les jetons de design, sans valeur de couleur ou de rayon en dur | Règle de lint ; revue |
| MAINT-03 | Analysabilité | TypeScript en mode strict, zéro `any` implicite ; décisions structurantes consignées en ADR | `tsc --noEmit` en CI ; index des ADR à jour |
| MAINT-04 | Modifiabilité | Paiement et envoi d'e-mails derrière des interfaces ; code mort détecté | Test de substitution d'un adaptateur ; détection du code mort en CI |
| MAINT-05 | Testabilité | Règles métier (panier, prix, commande) testées unitairement ; couverture de lignes de ce périmètre ≥ 80 % (**seuil personnel**) | Rapport de couverture en CI |
| MAINT-06 | Lisibilité de l'historique | Commits au format Conventional Commits, une pull request par issue | Contrôle du titre de PR en CI |
| MAINT-07 | Reproductibilité | Un clone et une commande suffisent à lancer l'application | Test sur un poste vierge, documenté dans le README |

La modularité que je vise correspond à la recommandation de Next.js pour les nouveaux projets : une couche d'accès aux données isolée, exécutée uniquement côté serveur, qui porte les contrôles d'autorisation et ne renvoie que des objets minimaux [S31]. Sécurité et maintenabilité convergent donc sur la même structure.

## 5. Conformité juridique et protection des données

Le site est fictif et non publié : aucune de ces obligations ne s'applique en droit. Je les traite comme pour un site réel, parce qu'un lead développeur doit savoir les identifier.

| Id | Exigence | Cible | Source |
| --- | --- | --- | --- |
| LEG-01 | Mentions légales accessibles depuis toutes les pages | Page dédiée avec emplacements pour l'identité de l'éditeur et de l'hébergeur | [S27] |
| LEG-02 | Conditions générales de vente | Page dédiée couvrant prix TTC, livraison, paiement, rétractation, garantie légale, médiation | [S27] |
| LEG-03 | Droit de rétractation | Délai de 14 jours affiché. L'exclusion des biens périssables ne vaut pas pour les denrées portant une date de durabilité minimale : l'huile d'olive reste donc couverte | [S28] |
| LEG-04 | Information sur les données personnelles | À chaque collecte : responsable, finalité, base légale, durée de conservation, droits | [S27] |
| LEG-05 | Traceurs | Uniquement des traceurs exemptés de consentement (authentification, panier, langue) ; aucun outil de mesure d'audience ni publicitaire. Aucun bandeau n'est alors requis ; une page d'information décrit les cookies utilisés | [S23] |
| LEG-06 | Minimisation | Seules les données nécessaires à la commande sont demandées ; le compte peut être supprimé | [S27] |
| LEG-07 | Libellé du bouton de commande | Mention explicite de l'obligation de paiement sur le bouton final | Voir la limite ci-dessous |

**Limite de vérification (LEG-07).** L'obligation d'un bouton portant la mention « commande avec obligation de paiement » ou une formule équivalente est attribuée par plusieurs commentaires juridiques à l'article L. 221-14 du Code de la consommation et à la directive 2011/83/UE ; je n'ai pas relu le texte consolidé sur Légifrance. J'applique la règle par prudence ; le texte devra être relu avant toute mise en production réelle.

Les textes des pages légales contiennent des emplacements entre crochets : seul un commerçant réel, conseillé par un juriste, peut les remplir.

## 6. Internationalisation

| Id | Exigence | Cible | Mesure |
| --- | --- | --- | --- |
| I18N-01 | Deux langues complètes | Français (par défaut) et anglais sur toutes les pages et tous les messages | Test : aucune clé de traduction manquante |
| I18N-02 | URL par langue | Préfixe de langue dans le chemin (`/fr/...`, `/en/...`) | Tests de routage |
| I18N-03 | Aucun texte en dur | Tous les textes visibles passent par les fichiers de messages | Règle de lint |
| I18N-04 | Formats localisés | Prix, dates et nombres formatés selon la langue | Tests unitaires |
| I18N-05 | Référencement multilingue | Balises `hreflang` réciproques et attribut `lang` correct | Test automatisé |

Le découpage par sous-chemin est l'une des deux approches décrites par Next.js pour le routage internationalisé [S35].

## 7. Écoconception

Je m'appuie sur le Référentiel général d'écoconception de services numériques (RGESN, version 2 de 2024, porté par l'Arcep et l'Arcom en lien avec l'ADEME) comme guide de bonnes pratiques [S29]. Je n'ai pas vérifié son caractère obligatoire ; je l'utilise comme référentiel volontaire.

| Id | Exigence | Cible |
| --- | --- | --- |
| ECO-01 | Sobriété des pages | Je mesure et je consigne le poids total et le nombre de requêtes à chaque sprint ; je justifie toute hausse dans la pull request |
| ECO-02 | Pas de service tiers superflu | Aucun script tiers, aucune police ni image chargée depuis un domaine externe |
| ECO-03 | Médias adaptés | Images servies au format et à la taille adaptés à l'écran, chargement différé hors écran |

Ces exigences recoupent PERF-05 et PERF-06 : la sobriété et la performance se mesurent avec les mêmes outils.

## 8. Exploitabilité

Même en local, l'application doit pouvoir être lancée, observée et diagnostiquée sans connaître son code. Les principes viennent de la méthodologie *Twelve-Factor App* [S12].

| Id | Exigence | Cible | Principe [S12] |
| --- | --- | --- | --- |
| OPS-01 | Configuration par l'environnement | Aucune valeur de configuration dans le code ; un fichier `.env.example` documente chaque variable ; l'application refuse de démarrer si une variable manque ou est invalide | III. Config |
| OPS-02 | Journaux sur la sortie standard | Journaux structurés, un événement par ligne, sans donnée personnelle | XI. Logs |
| OPS-03 | Parité des environnements | Même image Docker et même version de PostgreSQL en développement, en test et en démonstration | X. Dev/prod parity |
| OPS-04 | Dépendances déclarées | Versions verrouillées ; version de Node.js imposée par le dépôt | II. Dependencies |
| OPS-05 | État de santé | Point de contrôle qui vérifie l'application et la base de données | — |
| OPS-06 | Tâches d'administration | Migrations et jeu de données lancés par des commandes dédiées, ponctuelles | XII. Admin processes |

## Tableau de bord des exigences

| Domaine | Exigences | Vérification continue (CI) | Vérification à l'audit final |
| --- | --- | --- | --- |
| Performance | PERF-01 à 06 | Budget de poids, Lighthouse CI | Mesures complètes sur les trois parcours |
| Sécurité | SEC-01 à 13 | Tests d'autorisation, audit des dépendances, analyse statique | Revue ASVS, tests manuels ciblés |
| Accessibilité | A11Y-01 à 08 | axe-core | Clavier, lecteur d'écran, zoom, 320 px |
| Maintenabilité | MAINT-01 à 07 | Lint, typage, couverture, code mort | Revue d'architecture |
| Conformité | LEG-01 à 07 | — | Relecture des pages légales |
| Internationalisation | I18N-01 à 05 | Clés manquantes, routage | Parcours dans les deux langues |
| Écoconception | ECO-01 à 03 | Poids des pages | Bilan par page |
| Exploitabilité | OPS-01 à 06 | Démarrage du conteneur, point de santé | Installation sur un poste vierge |
