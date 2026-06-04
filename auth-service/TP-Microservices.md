# TP - Architecture Microservices avec Express

## Pourquoi on fait ça ?

Jusqu'ici vous avez fait des APIs "monolithiques" : un seul projet Express qui gère tout. C'est simple, ça marche, mais ça pose des problèmes à grande échelle :
- Si le service d'authentification plante, toute l'app est down
- Impossible de scaler uniquement la partie qui en a besoin
- Un bug dans un module peut casser tout le reste

Les **microservices** répondent à ce problème : on découpe l'application en petits services indépendants, chacun responsable d'une seule chose.

## Ce qu'on va construire

```
CLIENT (Postman / navigateur)
        |
        v
[ API GATEWAY :3000 ]  ← point d'entrée unique
    /api/qcms  →  [ QCM SERVICE :3001 ]
    /api/auth  →  [ AUTH SERVICE :3002 ]
```

Trois projets Node/Express indépendants :
- **api-gateway** : reçoit toutes les requêtes, les redirige vers le bon service
- **qcm-service** : gère les QCMs et les réponses des utilisateurs
- **auth-service** : gère l'inscription et la connexion (JWT)

Le gateway est aussi responsable de **protéger** les routes du QCM : avant de laisser passer une requête, il demande au service d'auth si le token est valide.

---

## Partie 1 — QCM Service (90 min)

Clonez votre template Express dans un dossier `qcm-service`. Ce service tourne sur le **port 3001**.

> **Question avant de commencer** : votre template a un middleware d'authentification. Qui va gérer l'auth dans cette architecture ? Est-ce que le qcm-service en a encore besoin ? Réfléchissez avant de coder.

### Modèle de données

Créez une base Neon dédiée à cette API (vous savez faire ça depuis le TP précédent).

Définissez vos modèles Prisma (demander la consigne personnelle ^^)
Pas de JSON !

### Routes à implémenter

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/qcms` | Liste tous les QCMs |
| GET | `/qcms/:id` | Récupère un QCM par son id |
| GET | `/qcms/:id/result` | Récupère le résultat d'un QCM (score) |
| GET | `/qcms/:id/question` | Récupère la prochaine question d'un QCM pour un utilisateur (celui qui n'a pas encore répondu ou réponse en cours) |
| POST | `/qcms` | Crée un QCM avec les questions |
| DELETE | `/qcms/:id` | Supprime un QCM  et les questions associées |
| POST | `/qcms/:id/response` | Soumet une réponse |

### Route de santé

Ajoutez une route `GET /health` qui retourne `{ status: "ok", service: "qcm-service" }`. Elle sera utile pour vérifier que le service tourne.

### Tester

Utilisez un fichier `qcm-service.http` pour tester vos routes.

## Partie 2 — API Gateway (60 min)

L'API Gateway est le **point d'entrée unique** de votre architecture. Les clients ne connaissent que lui.

Clonez votre template dans un dossier `api-gateway`. Ce service tourne sur le **port 3000**.

Installez les dépendances :
```bash
npm install http-proxy-middleware
```

Pas de base de données pour le gateway — il ne stocke rien, il redirige.

### Comprendre le proxy

Le gateway reçoit une requête sur `/api/qcms`, la **retransmet** au qcm-service sur `localhost:3001/qcms`, et **renvoie** la réponse au client.

Utilisez [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware) pour créer les proxies vers chaque service. Lisez la doc.

### Routes à implémenter

Toutes les routes `/api/qcms/*` → qcm-service. Pensez au `pathRewrite`.

### Tester

Lancez les deux services dans deux terminaux séparés, puis testez via le port 3000 :

```http
### Via le gateway
GET http://localhost:3000/api/qcms

### Via le gateway — Créer un QCM
POST http://localhost:3000/api/qcms
Content-Type: application/json

{
  "title": "Test via Gateway",
  "questions": [
    { "text": "Express est un framework ?", "options": ["Oui", "Non"], "answer": 0 }
  ]
}
```

> Le résultat doit être identique à un appel direct sur le port 3001.

---

## Partie 3 — Auth Service (90 min)

Ce service gère l'inscription, la connexion et la **vérification des tokens JWT**.

Clonez votre template dans un dossier `auth-service`. Ce service tourne sur le **port 3002**. Créez une base Neon dédiée.

Vous avez déjà fait ça — implémentez les routes **au même format que Strapi** :

| Méthode | Route |
|---------|-------|
| POST | `/auth/local/register` |
| POST | `/auth/local` |
| GET | `/users/me` |

`GET /users/me` est la route que le gateway appellera pour vérifier un token. Elle doit retourner les infos de l'utilisateur connecté si le token est valide, `401` sinon.

---

## Partie 4 — Protéger le QCM via le Gateway (60 min)

Le gateway va maintenant **interroger l'auth service** avant de laisser passer certaines requêtes.

### Le middleware d'auth dans le gateway

Le gateway délègue la vérification du token à l'auth-service en appelant `GET /users/me`. Pas de secret partagé — si le service répond 200, le token est valide.
Le middleware `requireAuth` doit faire un appel HTTP à l'auth-service pour vérifier le token, et bloquer la requête si le token est invalide.
Si le token est valide, `requireAuth` laisse passer la requête au proxy qui redirige vers le qcm-service et injecte le userId dans le header (ex: `X-User-Id`) pour que le qcm-service puisse l'utiliser.

> **Vous voyez maintenant qui fait la vérification du token.** Revenez sur votre qcm-service : son middleware d'auth est-il encore utile ? Que se passe-t-il si vous le laissez ? Que se passe-t-il si vous l'enlevez ?

### Quelles routes protéger ?

`requireAuth` s'intercale entre la route et le proxy, exactement comme n'importe quel middleware Express :

```js
// Publique — pas de requireAuth
app.get('/api/qcms', qcmProxy);

// Protégée — requireAuth appelé avant de laisser passer au proxy
app.post('/api/qcms', requireAuth, qcmProxy);
```

| Route gateway | Protection |
|---------------|-----------|
| `GET /api/qcms` | Publique |
| `GET /api/qcms/:id` | Publique |
| `POST /api/qcms` | `requireAuth` |
| `DELETE /api/qcms/:id` | `requireAuth` |
| `POST /api/qcms/:id/response` | `requireAuth` |
| `POST /api/auth/local/register` | Publique |
| `POST /api/auth/local` | Publique |

Ajoutez aussi un proxy vers l'auth-service pour les routes `/api/auth/*` et `/api/users/*` :

### Schéma du flux

```
Client → POST /api/qcms (avec token)
         ↓
    [API Gateway :3000]
         |
         ├── GET /verify → [Auth Service :3002]
         |       ↓ token valide ✓
         |
         └── POST /qcms → [QCM Service :3001]
                                 ↓
                           201 Created
                                 ↓
    [API Gateway] → Client
```

### Tester l'architecture complète

Lancez les trois services :
```bash
# Terminal 1 — cd qcm-service
# Terminal 2 — cd auth-service  
# Terminal 3 — cd api-gateway
# Lancer chaque service
```

```http
### 1. S'inscrire
POST http://localhost:3000/api/auth/local/register

### 2. Se connecter → copier le token
POST http://localhost:3000/api/auth/local

### 3. Créer un QCM SANS token → doit retourner 401
POST http://localhost:3000/api/qcms

### 4. Créer un QCM AVEC token
POST http://localhost:3000/api/qcms
Content-Type: application/json
Authorization: Bearer TON_TOKEN

### 5. Lister les QCMs — public
GET http://localhost:3000/api/qcms
```

---

## Bonus — Docker Compose

Docker Compose permet de lancer tous vos services avec **une seule commande**.

### Dockerfiles

Ajoutez un `Dockerfile` dans chaque projet :
> Adaptez `EXPOSE` : 3000 pour gateway, 3001 pour qcm, 3002 pour auth.

### docker-compose.yml


Créez un fichier `docker-compose.yml` à la racine du projet (au même niveau que les dossiers des services) :


> **Piège** : dans Docker, `localhost:3001` n'existe pas entre conteneurs. Docker Compose crée un réseau interne où chaque service est accessible via son **nom de service** (`qcm-service`, `auth-service`). C'est pourquoi les URLs sont dans des variables d'environnement — en local on utilise `localhost`, dans Docker on utilise le nom du service.

### Lancer

```bash
docker-compose up --build
```

### Déployer sur VPS

```bash
# Copier ou cloner le projet sur le VPS
ssh user@votre-vps
cd /app
docker-compose up --build -d
```

---

## Récap

| Service | Port | Base de données |
|---------|------|----------------|
| api-gateway | 3000 | aucune |
| qcm-service | 3001 | Neon (qcms + responses) |
| auth-service | 3002 | Neon (users) |

**Ce que vous avez mis en pratique :**
- Découper une app en services indépendants avec chacun sa base
- Proxifier des services avec `http-proxy-middleware`
- Implémenter un pattern API Gateway
- Déléguer la vérification d'identité à un service dédié
- Configurer Docker Compose pour orchestrer plusieurs conteneurs
