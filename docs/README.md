# Documentation

J'organise la documentation selon ce que le lecteur vient y chercher. Je m'inspire de Diátaxis, qui distingue quatre types de documents : tutoriels, guides pratiques, référence et explication [S10].

## Par où commencer

| Vous voulez… | Lisez |
| --- | --- |
| Comprendre le projet en cinq minutes | La synthèse de l'[audit de cadrage](audit/README.md) |
| Savoir pourquoi telle technologie a été choisie | L'[étude technique](audit/03-etude-technique.md), puis l'[ADR](adr/README.md) correspondant |
| Voir à quoi le site doit ressembler | La [maquette](../design/README.md) |
| Savoir ce qui est prévu, et dans quel ordre | Le [plan de projet](project/plan-de-projet.md) et le [backlog](project/backlog.md) |
| Comprendre comment le code sera structuré | L'[architecture cible](project/architecture.md) |
| Connaître ma méthode de travail | Les [guides de méthode](playbooks/README.md) |
| Contribuer | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Vérifier une affirmation | La [bibliographie](audit/sources.md) |

## Plan de la documentation

| Dossier | Contenu | Type |
| --- | --- | --- |
| [`audit/`](audit/README.md) | Contexte, exigences de qualité, étude technique, risques, plan de l'audit final, sources | Explication et référence |
| [`adr/`](adr/README.md) | Une décision d'architecture par fichier | Explication |
| [`project/`](project/plan-de-projet.md) | Plan de projet, architecture cible, backlog, comptes rendus de sprint ([0](project/sprints/sprint-0.md), [1](project/sprints/sprint-1.md)) | Référence |
| [`playbooks/`](playbooks/README.md) | Mener un projet, traiter un sujet technique, listes de contrôle | Guides pratiques |
| [`../design/`](../design/README.md) | Maquette, jetons de design, contrastes | Référence |

Les guides pratiques (installation, commandes du quotidien, dépannage) seront écrits avec le code, à partir du sprint 1.

## Conventions

- La documentation est en français ; le code, les commits, les issues et les pull requests sont en anglais.
- J'écris à la première personne : ce sont mes choix, et j'en réponds.
- Une affirmation factuelle porte une référence `[Sxx]` vers la [bibliographie](audit/sources.md), où j'indique comment je l'ai vérifiée.
- Un document décrit une chose. Quand une information existe ailleurs, je fais un lien plutôt qu'une copie.
- La documentation passe par les mêmes pull requests et la même CI que le code : mise en forme vérifiée, liens internes vérifiés à chaque pull request, liens externes vérifiés chaque semaine.
