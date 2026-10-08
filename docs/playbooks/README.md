# Guides de méthode

Ces guides décrivent ma façon de travailler en tant que lead développeur. Je les ai tirés de ce projet, mais ils sont écrits pour servir au suivant : ils ne dépendent ni de Zolive ni de sa pile technique.

| Guide | Question à laquelle il répond |
| --- | --- |
| [Mener un projet](mener-un-projet.md) | Comment aller d'une demande à une version livrée, sans coder avant d'avoir compris ni déclarer terminé avant d'avoir prouvé |
| [Traiter un sujet technique](traiter-un-sujet-technique.md) | Comment instruire un choix technique avec des sources croisées, et dire honnêtement où elles s'arrêtent |
| [Listes de contrôle](checklists.md) | Les deux guides, condensés en gestes vérifiables |

## Trois principes

1. **Comprendre avant de décider, décider avant de coder.** Les questions viennent d'abord, les exigences avant les outils, les décisions avant le code.
2. **Prouver plutôt qu'affirmer.** Une exigence a une mesure, un choix a des sources, une fonctionnalité a un test. Ce qui n'est pas vérifié est signalé comme tel.
3. **Écrire pour celui qui arrive après.** Une décision sans trace devra être reprise à zéro, y compris par moi dans six mois.

## Comment ces guides s'appliquent ici

| Principe | Où le voir dans ce dépôt |
| --- | --- |
| Des exigences mesurables avant les choix techniques | [Exigences de qualité](../audit/02-exigences-qualite.md) |
| Des choix comparés à leurs alternatives, avec leurs contreparties | [Étude technique](../audit/03-etude-technique.md), [ADR](../adr/README.md) |
| Des sources classées par niveau de vérification | [Bibliographie](../audit/sources.md) |
| Aucun changement sans issue, branche, pull request et CI verte | [`CONTRIBUTING.md`](../../CONTRIBUTING.md), historique de `main` |
| Un plan écrit avant le code | [Plan de projet](../project/plan-de-projet.md), [backlog](../project/backlog.md) |
