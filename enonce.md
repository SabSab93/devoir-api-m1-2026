# TP Noté : Architecture, Sécurité et Standardisation d'APIs

## Contexte & Objectifs

Vous travaillez sur le système d'information d'une entreprise qui possède une architecture technique hétérogène (legacy, microservices, conteneurs). Votre mission est de nettoyer, sécuriser et standardiser cette infrastructure en réalisant 3 PR totalement indépendantes.

Pour valider vos compétences en architecture plutôt qu'en "copier-coller" de CRUD classiques, **chaque PR devra être réalisée sur une branche Git dédiée** à partir de la base commune.

## Protocole Git Obligatoire (Gestion des Branches)
  
Pour éviter qu'une erreur sur une tâche ne bloque tout votre TP, vous devez isoler vos travaux. **Le non-respect de ce protocole entraînera une pénalité.**

1. Vous partez de la branche `main`. Ne codez jamais sur `main`.
2. Pour chaque PR :
   * Créez et basculez sur la branche requise (ex: `git checkout -b feat-task1`).
   * Réalisez l'exercice et validez-le avec le fichier `.http` à jour pour le service concerné.
   * Faites un `git commit` de vos modifications assez fréquemment pour éviter de perdre du travail.
   * Revenez sur `main` (`git checkout main`) avant de passer à la tâche suivante.

---

## Tâche 1 - Utilisation d'une API (4 points)

Vous devez lancer et utiliser l'API qui permet du CRUD sur la ressource schiste (des cailloux quoi ^^) dans le dossier `api-go-schiste`.
Documentez les routes de l'API que vous avez utilisées dans le fichier `api-go-schiste/requests.http`
C'est un CRUD classique sans authentification ^^

## Tâche 2 - Amélioration d'une API REST (6 points)

Auditez l'API de voitures dans le dossier `api-voitures` et réalisez les améliorations que vous jugez nécessaires pour la rendre plus professionnelle, sécurisée et maintenable.

ATTENTION : Chaque modification est un commit séparé, avec un message de commit clair et précis !

Dans cette tâche j'aimerai que toutes les routes de la ressource voitures soient protégées !

Mettez bien à jour le fichier `requests.http` pour documenter les routes que vous avez créées ou modifiées.

## Tâche 3 - Authentification BASIC (4 points)

Implémentez une authentification BASIC pour protéger les routes de création, modification et suppression de l'API de voitures.

> **Indice :** Le standard HTTP Basic Auth attend un header de la forme `Authorization: Basic <valeur>` où `<valeur>` est le résultat de `btoa("login:password")` encodé en base64. Exemple : `btoa("toto:tata")` → `dG90bzp0YXRh`.

Mettez bien à jour le fichier `requests.http` pour documenter les routes que vous avez protégées, et comment tester l'authentification.

Ne conserver que le code minimum nécessaire pour faire fonctionner l'authentification la protection des routes ! 

## Tâche 4 - Création d'une API Gateway (6 points)

Créez une API Gateway dans le dossier `api-gateway` qui fera le lien entre les différentes APIs que vous avez utilisées ou améliorées dans les tâches précédentes.

L'authentification doit être gérée au niveau d'un microservice dédié (celui de votre choix : custom ou un facile à intégrer pour vous).

Seule la ressource voitures est protégée par une authentification, la ressource schiste est publique.

ATTENTION : vous repartez de la branche initiale. Donc vous n'avez pas accès à vos modifications de la tâche 2 ! Ni de la tâche 3 !

Mettez bien à jour le fichier `requests.http` pour documenter les routes accessibles via l'API Gateway.

Si vous y arriver ^^ :
Pensez à garder les routes de lecture (méthode GET), publique pour la ressource voitures, et à protéger les routes de création, modification et suppression (POST, PUT, DELETE) avec une authentification. Comme c'est le cas dans l'API de voitures actuellement.