# Listes de contrôle

Ces listes condensent les deux guides en gestes vérifiables. Je les utilise telles quelles : une liste sert à ne rien oublier quand je suis pressé, pas à réfléchir à ma place.

## Démarrer un projet

- [ ] J'ai reformulé la demande et elle a été validée
- [ ] Je connais l'échéance, les contraintes imposées et le cadre d'évaluation
- [ ] Le périmètre est écrit, priorisé, avec ses exclusions et leur raison
- [ ] Chaque attente de qualité est une exigence mesurable : cible, mesure, source
- [ ] Les risques ont une prévention, un signal d'alerte et un repli
- [ ] Le plan de l'audit final est écrit
- [ ] Les choix techniques sont comparés à leurs alternatives et consignés en ADR
- [ ] Les règles de contribution sont écrites et la branche principale est protégée
- [ ] La CI tourne, même sur un dépôt vide
- [ ] Le backlog existe : issues avec critères d'acceptation, priorité, estimation, sprint
- [ ] Le cadrage est validé avant la première ligne de code

## Prendre une issue

- [ ] Elle a des critères d'acceptation testables
- [ ] Elle est estimée, à 8 points au plus
- [ ] Ses dépendances sont terminées
- [ ] Chaque critère est démontrable avec ce qui existe déjà sur `main`
- [ ] Je n'ai aucune autre issue en cours
- [ ] Ma branche part de `main` à jour et s'appelle `<type>/<issue>-<résumé>`

## Avant d'ouvrir une pull request

- [ ] Chaque critère d'acceptation est démontré, et je peux dire comment
- [ ] Les tests sont au bon niveau et échouaient avant mon changement
- [ ] Lint, typage, tests et build passent en local
- [ ] Les textes visibles existent en français et en anglais
- [ ] Le changement se parcourt au clavier, le focus reste visible
- [ ] Aucune valeur de design hors jetons, aucun texte en dur
- [ ] Aucun secret, aucune donnée personnelle, aucun reste de débogage
- [ ] La documentation, l'ADR concerné et le journal des modifications sont à jour
- [ ] Le titre suit Conventional Commits et la description lie l'issue

## Relire mon propre diff

Je relis sur la page de la pull request, pas dans mon éditeur, et après une pause.

- [ ] Le diff ne fait qu'une chose
- [ ] Je comprends chaque ligne, y compris la configuration et le code repris d'une documentation
- [ ] Les noms disent ce que font les choses
- [ ] Les cas d'erreur sont traités, pas seulement le cas nominal
- [ ] Toute entrée venant de l'utilisateur est validée côté serveur
- [ ] Toute lecture ou écriture de données d'un client vérifie la session et la propriété
- [ ] Tout comportement de sécurité confié à une bibliothèque est vérifié dans sa documentation ou son code, et verrouillé par un test
- [ ] Aucune action serveur ne renvoie plus que ce dont l'interface a besoin
- [ ] Rien n'importe la base de données hors de la couche d'accès aux données
- [ ] Le changement améliore la santé du code, ou au moins ne la dégrade pas

## Clore un sprint

- [ ] J'ai déroulé les parcours sur le build de production
- [ ] Chaque issue terminée respecte la *Definition of Done*
- [ ] Les issues non terminées retournent au backlog avec une note
- [ ] La vélocité est notée et la suite replanifiée avec elle
- [ ] Le registre des risques est relu
- [ ] Le compte rendu de sprint est écrit, avec une seule action d'amélioration

## Mener l'audit final

- [ ] Je mesure le build de production, lancé comme en démonstration
- [ ] Pour chaque mesure : commande, version de l'outil, date, commit
- [ ] Chaque ligne du plan d'audit a une valeur, un statut et une preuve
- [ ] Chaque écart a une issue ; je ne corrige rien pendant l'audit
- [ ] L'audit est rejoué après correction, et les deux résultats sont conservés
- [ ] Les limites de l'audit sont écrites

## Instruire un sujet technique

- [ ] La question tient en une phrase et précise le contexte
- [ ] Les critères sont écrits avant les options
- [ ] « Ne rien ajouter » fait partie des options
- [ ] Chaque affirmation importante a une source primaire ou une mesure, datée
- [ ] J'ai cherché ce qui contredit mon option préférée
- [ ] J'ai vérifié par une commande ce qui pouvait l'être
- [ ] Les contreparties du choix sont écrites, avec leur parade
- [ ] Ce que je n'ai pas vérifié est signalé
- [ ] Le signal qui rouvrira la décision est noté
- [ ] L'ADR est écrit
