# Traiter un sujet technique

Ce guide décrit comment j'instruis une question technique : choisir une bibliothèque, trancher une architecture, évaluer un risque. Il s'applique aussi bien à une décision du projet qu'à une étude demandée par quelqu'un d'autre.

Le principe : **une décision technique est une affirmation, et une affirmation se prouve.** Mon avis ne vaut que par les éléments qui le soutiennent, et par la franchise avec laquelle je dis où ils s'arrêtent.

## Les neuf étapes

| # | Étape | Produit |
| --- | --- | --- |
| 1 | Formuler la question | Une phrase qui se termine par un point d'interrogation |
| 2 | Fixer les critères | Une liste ordonnée, écrite avant de regarder les options |
| 3 | Lister les options | Trois à cinq candidats, dont « ne rien faire » |
| 4 | Chercher les faits | Des sources datées, classées par fiabilité |
| 5 | Croiser | Au moins deux appuis indépendants par affirmation importante |
| 6 | Vérifier soi-même | Une commande, une mesure ou un prototype |
| 7 | Décider | Un choix, ses contreparties, ses parades |
| 8 | Dire ce qu'on ne sait pas | La liste des points non vérifiés |
| 9 | Prévoir la révision | Le signal qui rouvrira la question |

## 1. Formuler la question

Je ramène le sujet à une décision à prendre. « Étudier les ORM » n'est pas une question ; « quel outil d'accès aux données pour une application Next.js 16 qui doit créer des commandes de manière transactionnelle, à démarrer cette semaine ? » en est une.

Une bonne question précise le contexte, la contrainte et l'échéance. Elle borne aussi l'effort : une décision facile à défaire ne mérite pas la même étude qu'une décision qui engage tout le projet.

## 2. Fixer les critères avant de regarder les options

Si je choisis mes critères après avoir vu les candidats, je choisirai ceux qui arrangent mon favori. Je les écris donc d'abord, dans l'ordre où ils comptent.

Ceux que j'utilise par défaut :

1. **Adéquation** : couvre-t-il le besoin sans contournement ?
2. **Sécurité** : quel historique, quelles précautions d'emploi ?
3. **Pérennité** : est-il maintenu, avec une politique de support claire ?
4. **Adoption** : trouverai-je de l'aide et des intégrations ?
5. **Coût d'entrée** : quelle complexité ajoute-t-il ?

## 3. Lister les options

Je retiens les candidats crédibles, pas tous les candidats. J'inclus toujours l'option de ne rien ajouter : utiliser ce que la plateforme fournit déjà est souvent le meilleur choix, et c'est celui qu'on oublie.

Quand une option est imposée, je l'écris comme une contrainte et je n'habille pas la contrainte en conclusion. L'étude sert alors à vérifier que le choix tient et à documenter ce qu'il coûte.

## 4. Chercher les faits

Toutes les sources ne se valent pas. Je les classe.

| Rang | Type de source | Exemples | Usage |
| --- | --- | --- | --- |
| 1 | Primaire | Spécification, texte officiel, documentation de l'éditeur, avis de sécurité, code source | Fonde une affirmation |
| 1 | Mesure | Commande, registre de paquets, test, prototype | Fonde une affirmation |
| 2 | Enquête | Sondages d'usage et de satisfaction | Donne une tendance, jamais une preuve seule |
| 3 | Secondaire | Article, tutoriel, comparatif d'un tiers | Sert de piste vers la source primaire |
| — | Mémoire | « Il me semble que… » | Ne fonde rien : je vérifie ou je me tais |

Pour chaque source, je note la date de consultation et ce qu'elle établit exactement. Une documentation décrit une version : je vérifie laquelle.

Trois réflexes :

- **Remonter à l'origine.** Quand un article cite un chiffre, je vais lire le document d'où il vient.
- **Dater.** Un comparatif de deux ans décrit des logiciels qui n'existent plus sous cette forme.
- **Repérer l'intérêt de l'auteur.** Un éditeur qui se compare à son concurrent n'est pas neutre. Je peux le lire, pas m'en contenter.

## 5. Croiser

Une affirmation importante repose sur au moins deux appuis indépendants, ou sur une source et une vérification directe.

Je cherche activement **la source qui me contredit**. Si je penche pour un outil, je lis ses avis de sécurité, ses critiques, ses points de douleur. Une étude qui ne mentionne aucune faiblesse du candidat retenu n'a pas été faite.

Quand deux sources divergent, je ne fais pas de moyenne : je cherche pourquoi. Version différente, périmètre différent, date différente. Si je ne trouve pas, j'écris qu'elles divergent.

## 6. Vérifier soi-même

Ce qui peut se vérifier par une commande se vérifie par une commande.

- Version réellement publiée, étiquettes de distribution, dépendances déclarées : le registre de paquets le dit en une ligne.
- Compatibilité entre deux bibliothèques : leurs dépendances déclarées le disent mieux que n'importe quel article.
- Comportement réel : un prototype borné dans le temps.

Pour un prototype, je fixe avant de commencer la question à laquelle il doit répondre et la durée que je lui accorde. À l'échéance, je décide avec ce que j'ai, et je jette le code : un prototype n'est pas un début d'implémentation.

## 7. Décider

Je rédige la décision dans un ADR [S08] : contexte, critères, options, choix, conséquences. J'y écris en particulier :

- **ce que le choix coûte**, sans l'adoucir ;
- **la parade** à chaque contrepartie ;
- **pourquoi les autres options sont écartées**, en une phrase chacune.

Si je n'arrive pas à écrire ce que mon choix coûte, c'est que je ne l'ai pas compris.

## 8. Dire ce qu'on ne sait pas

Je distingue toujours ce que j'ai lu dans la source primaire, ce que je tiens d'un tiers, et ce que je n'ai pas vérifié. Quand je n'ai pas lu le texte d'origine, je l'écris, et je précise si la décision en dépend.

Une incertitude signalée est une information. Une incertitude cachée est une dette que quelqu'un d'autre paiera.

## 9. Prévoir la révision

Une décision est bonne à une date. Je note le signal qui la rouvrira : la sortie d'une version, la fin d'un support, un seuil de mesure franchi. Ce signal rejoint le registre des risques.

## Exemple complet : le choix de l'ORM de Zolive

| Étape | Ce que j'ai fait |
| --- | --- |
| Question | Quel outil d'accès aux données pour une application Next.js 16 avec des commandes transactionnelles, à démarrer maintenant ? |
| Critères | Compatibilité avec la bibliothèque d'authentification, stabilité à la date de démarrage, lisibilité des migrations, typage |
| Options | Drizzle ORM, Prisma 7, Prisma 8, SQL à la main |
| Faits, source primaire | La documentation des migrations de Prisma décrit déjà les commandes de la version 8 [S52] |
| Faits, mesure | Sur le registre npm, l'étiquette `latest` de Prisma pointe sur une version candidate ; la dernière stable est sous `prev`. Better Auth déclare supporter Prisma 5 à 7 et Drizzle 0.45 [S41] |
| Source partiale repérée | La comparaison publiée par Prisma se dit elle-même partiale [S44] : je l'ai lue, je ne m'y suis pas fié seul |
| Source qui me contredit | Semantic Versioning : en version 0.x, l'API de Drizzle peut changer à tout moment [S05] |
| Décision | Drizzle ORM, version exacte épinglée |
| Coût et parade | Risque de rupture d'API ; l'ORM est confiné à une seule couche et chaque requête a un test d'intégration |
| Signal de révision | Sortie stable de Drizzle 1.0 ou de Prisma 8 |
| Trace | [ADR 0003](../adr/0003-postgresql-drizzle.md), risque R-02 |

Ce qui a fait la décision n'est ni un article ni une impression : ce sont deux commandes sur le registre et une page de documentation, datées.

## Pièges fréquents

| Piège | Symptôme | Antidote |
| --- | --- | --- |
| Biais de confirmation | Je ne trouve que des arguments pour mon favori | Chercher d'abord ce qui le disqualifierait |
| Argument de popularité | « Tout le monde l'utilise » | La popularité est un critère parmi cinq, et le dernier que je cite |
| Source périmée | Un comparatif sans date, ou d'une version ancienne | Vérifier la version décrite et la date |
| Fausse précision | Des chiffres au dixième tirés d'un sondage | Donner l'ordre de grandeur et dire d'où il vient |
| Affirmation de mémoire | « Je crois que c'est supporté » | Une commande ou un lien, sinon rien |
| Prototype qui s'éternise | Trois jours sur une question d'une heure | Durée fixée avant de commencer |
| Décision sans trace | « On avait décidé ça, mais pourquoi ? » | Un ADR, même court |

## Sources

Les identifiants `[Sxx]` renvoient à la [bibliographie de l'audit](../audit/sources.md).
