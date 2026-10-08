# Sources

J'ai consulté toutes ces sources le **8 octobre 2026**. Pour chacune, j'indique ce qu'elle établit dans mon projet et comment je l'ai vérifiée.

## Niveaux de vérification

- **Primaire** : j'ai lu le document de l'auteur ou de l'éditeur lui-même.
- **Mesure** : j'ai obtenu le fait par une commande ou un calcul reproductible.
- **Secondaire** : le fait vient d'un tiers qui cite la source primaire, que je n'ai pas lue. Je signale dans le texte les affirmations qui en dépendent.

## Méthode, agilité et gestion de configuration

| Id | Source | Ce qu'elle établit | Vérification |
| --- | --- | --- | --- |
| S01 | [The Scrum Guide](https://scrumguides.org/scrum-guide.html), K. Schwaber et J. Sutherland, novembre 2020 | Trois responsabilités, cinq événements, trois artefacts et leurs engagements ; sprint d'un mois au plus | Primaire |
| S02 | [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow), GitHub Docs | Branche, modifications, pull request, relecture, fusion, suppression de la branche | Primaire |
| S03 | [Trunk-based development](https://dora.dev/capabilities/trunk-based-development/), DORA | Trois branches actives ou moins, fusion au moins quotidienne, pas de gel du code ; lien avec la performance de livraison | Primaire |
| S04 | [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) | Structure du message, types, changement incompatible, correspondance avec SemVer | Primaire |
| S05 | [Semantic Versioning 2.0.0](https://semver.org/) | Sens de MAJOR.MINOR.PATCH ; une version 0.y.z n'a pas d'API stable | Primaire |
| S06 | [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) | Principes et types de changements d'un journal des modifications | Primaire |
| S07 | [The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html), Google Engineering Practices | Approuver ce qui améliore nettement la santé du code ; les faits priment sur les préférences | Primaire |
| S08 | [Markdown Architectural Decision Records](https://adr.github.io/madr/), MADR 4.0.0 | Gabarit d'ADR : contexte, facteurs de décision, options, résultat, conséquences | Primaire |
| S09 | [Architectural Decision Records](https://adr.github.io/) | Définitions : décision d'architecture, exigence significative pour l'architecture, journal de décisions | Primaire |
| S10 | [Diátaxis](https://diataxis.fr/), D. Procida | Quatre types de documentation : tutoriels, guides pratiques, référence, explication | Primaire |
| S11 | [The C4 model](https://c4model.com/), S. Brown | Quatre niveaux de diagrammes : contexte, conteneurs, composants, code | Primaire |
| S12 | [The Twelve-Factor App](https://12factor.net/) | Les douze principes, dont configuration, journaux, parité des environnements | Primaire |
| S13 | [INVEST in Good Stories, and SMART Tasks](https://xp123.com/invest-in-good-stories-and-smart-tasks/), B. Wake, 17 août 2003 | Critères d'une bonne *user story* : Independent, Negotiable, Valuable, Estimable, Small, Testable | Primaire |
| S14 | [MoSCoW Prioritisation](https://www.agilebusiness.org/?p=1907), Agile Business Consortium (cadre DSDM) | Sens de *Must*, *Should*, *Could*, *Won't* ; effort des *Must* typiquement limité à 60 % | Secondaire : chiffre repris d'un résumé de la page, que je n'ai pas relu dans le manuel DSDM |
| S15 | [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), H. Vocke, 26 février 2018 | Tests de granularités différentes ; moins de tests à mesure qu'on monte en niveau | Primaire |

## Qualité, performance, sécurité, accessibilité

| Id | Source | Ce qu'elle établit | Vérification |
| --- | --- | --- | --- |
| S16 | [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010), portail ISO 25000 | Caractéristiques de qualité produit et sous-caractéristiques de la maintenabilité et de la sécurité | Secondaire : portail de présentation de la norme ; la norme elle-même est payante et je ne l'ai pas achetée |
| S17 | [Web Vitals](https://web.dev/articles/vitals), web.dev, mise à jour du 31 octobre 2024 | Seuils « bon » : LCP 2,5 s, INP 200 ms, CLS 0,1, au 75ᵉ centile | Primaire |
| S18 | [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring), Chrome for Developers | Pondération des métriques et plages de score | Primaire |
| S19 | [OWASP Top 10:2025 — Introduction](https://top10.owasp.org/2025/0x00_2025-Introduction) | Les dix catégories et les évolutions depuis 2021 | Primaire |
| S20 | [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), OWASP | Argon2id en premier choix et ses paramètres minimaux ; ordre de préférence des algorithmes | Primaire |
| S21 | [Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/), OWASP | Référentiel de vérification ; version stable 5.0.0 | Primaire |
| S22 | [Mots de passe : une nouvelle recommandation](https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite), CNIL, 14 octobre 2022 (délibération n° 2022-100) | Niveaux d'entropie par cas d'usage, stockage, fin du renouvellement périodique, limitation des tentatives | Primaire |
| S23 | [Cookies et autres traceurs : que dit la loi ?](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi), CNIL | Traceurs exemptés de consentement (authentification, panier, langue) ; règles du consentement | Primaire |
| S24 | [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/), W3C, recommandation du 12 décembre 2024 | Niveaux A, AA, AAA ; critères de contraste | Primaire (lecture ciblée sur les critères de contraste) |
| S25 | [Obligations d'accessibilité](https://accessibilite.numerique.gouv.fr/obligations/) et [champ d'application](https://accessibilite.numerique.gouv.fr/obligations/champ-application/), DINUM | RGAA 4.1.2 en vigueur, version 5 annoncée pour fin 2026 ; norme EN 301 549 V2.1.2 | Primaire |
| S26 | [European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en), Commission européenne | Le commerce en ligne fait partie des services couverts | Primaire pour ce point ; la date d'application et les exemptions n'y figurent pas |
| S27 | [Mentions obligatoires sur un site internet](https://entreprendre.service-public.gouv.fr/vosdroits/F31228), Service-Public Entreprendre | Mentions légales, conditions de vente, information sur les données, cookies | Primaire (page vérifiée par l'administration le 31 juillet 2023) |
| S28 | [Droit de rétractation](https://www.service-public.gouv.fr/particuliers/vosdroits/F10485), Service-Public | Délai de 14 jours, point de départ, exceptions, remboursement | Primaire (page vérifiée le 1ᵉʳ janvier 2026) |
| S29 | [Référentiel général d'écoconception de services numériques](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/), version 2, 2024 | Existence, auteurs et structure du référentiel | Primaire (lecture partielle) |

## Technologies

| Id | Source | Ce qu'elle établit | Vérification |
| --- | --- | --- | --- |
| S30 | [Support Policy](https://nextjs.org/support-policy), Next.js | Version 16 en *Active LTS*, version 15 en maintenance ; définition des deux phases | Primaire |
| S31 | [How to think about data security in Next.js](https://nextjs.org/docs/app/guides/data-security), documentation 16.4.0 | Couche d'accès aux données, actions serveur à traiter comme des points d'entrée publics, liste d'audit | Primaire |
| S32 | [How to implement authentication in Next.js](https://nextjs.org/docs/app/guides/authentication), documentation 16.4.0 | Recommandation d'une bibliothèque, options de cookie, contrôles optimistes et contrôles sûrs | Primaire |
| S33 | [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy), documentation 16.4.0 | Les *nonces* imposent le rendu dynamique ; variante sans *nonce* ; SRI expérimental | Primaire |
| S34 | [How to self-host your Next.js application](https://nextjs.org/docs/app/guides/self-hosting), documentation 16.4.0 | *Reverse proxy* recommandé, cache local à l'instance, variables d'environnement | Primaire |
| S35 | [Internationalization](https://nextjs.org/docs/app/guides/internationalization), documentation 16.4.0 | Routage par sous-chemin ou par domaine, dictionnaires, bibliothèques recommandées | Primaire |
| S36 | [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), React, 3 décembre 2025 | CVE-2025-55182, CVSS 10,0, frameworks touchés, versions corrigées | Primaire |
| S37 | [Postmortem on Next.js Middleware bypass](https://vercel.com/blog/postmortem-on-next-js-middleware-bypass), Vercel, 25 mars 2025 | CVE-2025-29927, mécanisme, versions corrigées, applications auto-hébergées touchées | Primaire |
| S38 | [Calendrier des versions de Node.js](https://github.com/nodejs/Release/blob/main/schedule.json), `schedule.json` | Dates de début, de LTS, de maintenance et de fin des versions 22, 24 et 26 | Primaire |
| S39 | [Stack Overflow Developer Survey 2025 — Technology](https://survey.stackoverflow.co/2025/technology/) | Usage déclaré des bases de données, frameworks et langages | Primaire |
| S40 | [State of JavaScript 2025 — Meta-frameworks](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/) | Domination de Next.js en usage, baisse de satisfaction, écart avec Astro | Primaire (commentaires lus ; les pourcentages par framework ne figurent pas dans le texte de la page) |
| S41 | [Registre npm](https://www.npmjs.com/) | Versions publiées, étiquettes de distribution, dépendances déclarées, téléchargements hebdomadaires | Mesure : `npm view <paquet> version dist-tags peerDependencies engines` et API de téléchargements, semaine du 28 septembre au 4 octobre 2026 |
| S42 | [Better Auth — Introduction](https://www.better-auth.com/docs/introduction) | Positionnement et fonctions de la bibliothèque | Primaire |
| S43 | [Auth.js is now part of Better Auth](https://www.better-auth.com/blog/authjs-joins-better-auth), 22 septembre 2025 | Reprise de la maintenance d'Auth.js ; recommandation pour les nouveaux projets | Primaire |
| S44 | [Prisma ORM vs Drizzle](https://www.prisma.io/docs/orm/more/comparisons/prisma-and-drizzle), Prisma | Différences d'approche entre les deux ORM | Primaire, source déclarée partiale par son auteur |
| S45 | [next-intl — App Router](https://next-intl.dev/docs/getting-started/app-router) | Traductions, formatage, routage, composants serveur | Primaire |
| S46 | [GitHub security features](https://docs.github.com/en/code-security/getting-started/github-security-features) | Fonctions de sécurité gratuites sur les dépôts publics | Primaire |
| S47 | [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), GitHub Docs | Règles de protection des branches | Primaire ; j'ai constaté la disponibilité sur mon dépôt en créant la règle |
| S48 | [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme) | Directive `@theme` et variables de thème | Primaire |
| S49 | [Mastère Lead Développeur Full Stack — EEMI](https://lexpress-education.com/ecole/eemi/programme/mastere-lead-developpeur-full-stack/), L'Express Éducation | Présentation publique du cursus | Secondaire ; je n'ai pas trouvé la fiche officielle du référentiel en ligne |
| S50 | [Vitest — Getting Started](https://vitest.dev/guide/) | Versions minimales de Node.js et de Vite | Primaire |
| S51 | [Playwright — Installation](https://playwright.dev/docs/intro) | Navigateurs et versions de Node.js supportés | Primaire |
| S52 | [Prisma Migrate — Getting started](https://www.prisma.io/docs/orm/prisma-migrate/getting-started) | La documentation par défaut décrit les commandes de la version 8 | Primaire |
| S53 | [Better Auth — Rate limit](https://www.better-auth.com/docs/concepts/rate-limit) | Limitation intégrée, valeurs par défaut, stockage | Primaire |
| S54 | [Better Auth — Email & Password](https://www.better-auth.com/docs/authentication/email-password) | Hachage par défaut, longueurs, fonction de hachage remplaçable | Primaire |

## Sources que je n'ai pas lues

J'aurais voulu m'appuyer sur ces sources primaires ; je ne les ai pas lues à ce stade. J'ai soit retiré, soit signalé dans le texte les affirmations qui en auraient dépendu, et je les relirai avant toute utilisation réelle du site.

| Source | Usage prévu | Conséquence |
| --- | --- | --- |
| Directive (UE) 2019/882, EUR-Lex | Date d'application et exemption des microentreprises | Non affirmées dans l'audit |
| Loi n° 2023-171 et décret n° 2023-931, Légifrance | Transposition française de la directive | Citées comme références à consulter, sans contenu repris |
| Article L. 221-14 du Code de la consommation, Légifrance | Libellé du bouton de commande | J'applique la règle par prudence et je la signale comme non vérifiée (LEG-07) |
| Fiche de la DGCCRF sur l'accessibilité des produits et services | Champ d'application pour le commerce en ligne | Remplacée par la page de la Commission européenne [S26] |
| Page de l'ISO sur la norme ISO/IEC 25010:2023 | Référence de la norme | Remplacée par le portail ISO 25000 [S16] |
| Grille d'évaluation détaillée de mon mastère | Alignement des livrables | Point ouvert : je la demande au formateur |
