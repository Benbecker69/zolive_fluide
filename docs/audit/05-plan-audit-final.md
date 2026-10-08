# 05 — Plan de l'audit final

Je mènerai l'audit final au sprint 4, sur le site livré. J'en écris le plan maintenant pour une raison simple : une exigence dont je n'ai pas prévu la mesure ne sera pas mesurée. Mon rapport d'audit reprendra ce document ligne à ligne, avec une valeur mesurée et une preuve en face de chaque cible.

## Mes principes

1. **Mesurer le build de production**, lancé avec Docker Compose, jamais le serveur de développement.
2. **Rendre chaque mesure reproductible** : commande, version de l'outil, date et commit sont notés.
3. **Conserver les preuves** dans le dépôt (`docs/audit/rapport/`) : rapports Lighthouse, sorties de commandes, captures.
4. **Distinguer trois statuts** : conforme, non conforme (avec une issue de correction), non vérifié (avec la raison).
5. **Ne pas corriger pendant l'audit.** Les écarts donnent lieu à des issues ; l'audit est rejoué après correction et les deux résultats sont conservés.

## Grille de vérification

### Performance

| Exigence | Méthode | Seuil | Preuve attendue |
| --- | --- | --- | --- |
| PERF-01, 02, 04 | Lighthouse CI, émulation mobile, trois passes par page, médiane retenue ; pages accueil, boutique, fiche produit, dans les deux langues | LCP ≤ 2,5 s ; CLS ≤ 0,1 ; score ≥ 90 | Rapports HTML et JSON |
| PERF-03 | TBT relevé par Lighthouse ; essai manuel des interactions du panier avec le panneau Performance du navigateur | Aucune tâche longue visible sur l'ajout au panier | Relevé du TBT, capture du profil |
| PERF-05 | Comparaison du poids de JavaScript du build avec le budget fixé en sprint 1 | Budget respecté | Sortie du build |
| PERF-06 | Onglet réseau sur les trois pages | Aucune requête vers un domaine tiers | Export de la liste des requêtes |

### Sécurité

| Exigence | Méthode | Seuil | Preuve attendue |
| --- | --- | --- | --- |
| SEC-01, 02 | Tests d'intégration : le compte A demande les commandes, l'adresse et le panier du compte B ; appel direct de chaque action serveur sans session | 100 % des accès refusés | Rapport de tests |
| SEC-01, 02 | Revue des fichiers `use server`, `use client`, `proxy.ts` et des routes dynamiques avec la liste d'audit publiée par Next.js [S31] | Aucun écart | Liste cochée, fichier par fichier |
| SEC-03 | Recherche de toute lecture d'entrée (`formData`, `params`, `searchParams`) hors d'un schéma de validation | Zéro occurrence | Sortie de la recherche |
| SEC-04 | Lecture d'un condensat en base ; test des paramètres | Préfixe `$argon2id$`, m ≥ 19456, t ≥ 2, p = 1 [S20] | Condensat anonymisé, sortie du test |
| SEC-05 | Essais de mots de passe faibles ; tentatives de connexion répétées | Mot de passe faible refusé ; blocage temporaire effectif | Rapport de tests de bout en bout |
| SEC-06 | Inspection du cookie de session ; réutilisation du cookie après déconnexion | `HttpOnly`, `Secure`, `SameSite=Lax` ; session refusée après déconnexion | Capture, sortie de test |
| SEC-07 | Requête de commande falsifiée (prix à zéro) ; deux commandes simultanées sur le dernier article | Prix recalculé ; une seule commande aboutit | Rapport de tests |
| SEC-08, 09 | Lecture des en-têtes de réponse sur une page publique et une page authentifiée | En-têtes présents ; aucune violation de CSP sur les parcours clés | Sortie de commande, console du navigateur |
| SEC-10 | `pnpm audit` ; alertes Dependabot ; résultats CodeQL | Aucune vulnérabilité haute ou critique ouverte | Sorties, captures |
| SEC-11, 12 | Erreur provoquée ; recherche de mots de passe, jetons et adresses e-mail dans les journaux | Aucune trace technique affichée ; aucune donnée sensible journalisée | Extrait de journal |
| SEC-13 | Version de Next.js comparée à la politique de support [S30] | Branche *Active LTS*, dernier correctif | Sortie de `pnpm list next` |
| Ensemble | Passage en revue des chapitres pertinents de l'OWASP ASVS 5.0.0 [S21] : authentification, gestion de session, contrôle d'accès, validation | Chaque exigence applicable est classée conforme, non conforme ou non applicable | Tableau de revue |

### Accessibilité

| Exigence | Méthode | Seuil | Preuve attendue |
| --- | --- | --- | --- |
| A11Y-05, 08 | axe-core sur chaque page des trois parcours, dans les deux langues | Zéro violation « sérieuse » ou « critique » | Rapport de tests |
| A11Y-02, 03 | Calcul des contrastes sur les jetons de couleur effectivement utilisés | Texte ≥ 4,5:1 ; contours de contrôles ≥ 3:1 [S24] | Tableau des rapports |
| A11Y-04 | Les trois parcours au clavier seul | Parcours achevés, focus toujours visible, aucun piège | Test de bout en bout, notes de contrôle manuel |
| A11Y-06, 07 | Lecture des formulaires et des messages d'erreur avec un lecteur d'écran | Chaque champ et chaque erreur sont annoncés ; langue correcte | Notes de contrôle |
| A11Y-01 | Zoom à 200 % et largeur de 320 px sur les pages clés | Aucun contenu tronqué, pas de défilement horizontal | Captures |
| A11Y-01 | Évaluation selon la méthode du RGAA 4.1.2 sur un échantillon de pages [S25] | Taux de conformité calculé et non-conformités listées | Grille d'évaluation |

### Maintenabilité

| Exigence | Méthode | Seuil | Preuve attendue |
| --- | --- | --- | --- |
| MAINT-01 | Règle de lint sur les imports ; recherche des imports de la base de données hors de la couche d'accès aux données | Zéro violation | Sortie du lint |
| MAINT-03 | `tsc --noEmit` en mode strict | Zéro erreur | Sortie de commande |
| MAINT-04 | Knip | Aucun fichier, export ou dépendance inutilisé non justifié | Sortie de commande |
| MAINT-05 | Couverture des règles métier | ≥ 80 % de lignes sur le périmètre défini | Rapport de couverture |
| MAINT-06 | Lecture de `git log` sur `main` | 100 % des commits au format convenu, chacun lié à une pull request | Sortie de commande |
| MAINT-07 | Installation sur un poste vierge en suivant le README | Application disponible sans intervention non documentée | Compte rendu chronométré |

### Conformité, internationalisation, écoconception, exploitabilité

| Exigence | Méthode | Seuil | Preuve attendue |
| --- | --- | --- | --- |
| LEG-01 à 07 | Relecture des pages légales et du tunnel de commande | Chaque mention attendue est présente ou marquée comme emplacement | Liste cochée |
| LEG-05 | Inventaire des cookies déposés sur chaque parcours | Uniquement authentification, panier, langue [S23] | Tableau des cookies |
| I18N-01 à 05 | Détection des clés manquantes ; parcours complets en anglais ; contrôle des balises `hreflang` | Zéro clé manquante, zéro texte en dur visible | Rapport de tests |
| ECO-01 à 03 | Poids et nombre de requêtes par page | Valeurs consignées et comparées à celles du sprint 1 | Tableau comparatif |
| OPS-01 à 06 | Démarrage sans variable obligatoire ; lecture des journaux ; appel du point de santé | Refus de démarrer explicite ; journaux structurés ; état correct | Sorties de commandes |

## Format du rapport

Mon rapport final (`docs/audit/rapport-audit-final.md`) contiendra, pour chaque ligne de cette grille : la valeur mesurée, le statut, le lien vers la preuve et, en cas d'écart, le numéro de l'issue de correction. Il s'ouvrira sur une synthèse d'une page : nombre d'exigences conformes, non conformes et non vérifiées par domaine, et les trois écarts les plus importants.

## Ce que cet audit ne couvre pas

- **Test d'intrusion par un tiers.** Je vérifie moi-même la sécurité du code que j'ai écrit ; cela ne remplace pas un regard extérieur.
- **Données de terrain.** Sans utilisateurs réels, les Core Web Vitals ne sont mesurés qu'en laboratoire [S17].
- **Tests avec des personnes en situation de handicap.** L'audit d'accessibilité est technique ; il ne mesure pas l'utilisabilité réelle.
- **Tenue en charge.** Aucun test de montée en charge n'est prévu pour une démonstration locale.

Je ferai figurer ces limites telles quelles dans le rapport.
