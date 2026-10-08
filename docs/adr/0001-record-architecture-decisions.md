# 0001 — Consigner les décisions d'architecture

- Statut : Acceptée
- Date : 2026-10-08
- Exigences concernées : MAINT-03

## Contexte et problème

Je travaille seul et je suis évalué sur ma capacité à justifier mes choix. Sans trace écrite, une décision prise en sprint 1 devient en sprint 4 « c'est comme ça », et je ne peux plus expliquer ni ce que j'ai écarté ni pourquoi.

## Facteurs de décision

- Pouvoir retrouver, des mois plus tard, le raisonnement derrière un choix.
- Garder la justification à côté du code, versionnée avec lui.
- Un format léger : s'il est lourd, je ne le tiendrai pas.

## Options envisagées

1. Ne rien consigner, s'appuyer sur l'historique Git.
2. Un document d'architecture unique, mis à jour au fil de l'eau.
3. Un ADR par décision, au format MADR.

## Décision

Je retiens l'option 3. Un ADR capture une seule décision et sa justification ; la collection forme le journal de décisions du projet. J'utilise le gabarit MADR 4.0.0, en Markdown, dans `docs/adr/`.

L'option 1 ne garde que le « quoi » : un commit ne dit pas quelles options ont été écartées. L'option 2 efface l'histoire à chaque mise à jour : on y lit l'état présent, pas le chemin.

## Conséquences

- Positif : chaque choix structurant est daté, argumenté et relisible ; un changement d'avis laisse une trace au lieu d'écraser l'ancienne décision.
- Négatif : un document de plus à écrire avant de coder. Je limite ce coût en réservant les ADR aux décisions difficiles à défaire.

## Confirmation

L'index de `docs/adr/README.md` liste tous les ADR. La *Definition of Done* exige qu'une pull request qui modifie une décision mette à jour l'ADR correspondant.

## Références

- [Architectural Decision Records](https://adr.github.io/) : définitions.
- [MADR 4.0.0](https://adr.github.io/madr/) : gabarit.
