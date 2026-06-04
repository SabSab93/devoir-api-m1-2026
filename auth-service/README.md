#  — Template Express + TypeScript + Prisma

Ce projet sert de template API pour créer rapidement une API REST avec :

- Express
- TypeScript
- Prisma 6
- PostgreSQL / Neon
- Argon2 pour le hash des mots de passe
- JWT pour l’authentification
- Routes CRUD
- Middleware d’authentification Bearer

---

## 1. Récupérer le projet

```bash
git clone <URL_DU_REPO> api-devoir
cd api-devoir
```

Exemple :

```bash
git clone https://github.com/<username>/miaouhotel-api.git
cd miaouhotel-api
```

---

git remote -v
git remote remove origin
git remote add origin URL_DU_NOUVEAU_REPO
git branch -M main
git push -u origin main


## 2. Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances listées dans `package.json`.

---

## 3. Vérifier les dépendances importantes

Le projet utilise Prisma 6 pour rester compatible avec la structure classique :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Versions recommandées :

```json
"dependencies": {
  "@prisma/client": "^6.19.3",
  "argon2": "^0.44.0",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3"
},
"devDependencies": {
  "@types/cors": "^2.8.19",
  "@types/express": "^5.0.6",
  "@types/jsonwebtoken": "^9.0.11",
  "@types/node": "^25.9.1",
  "prisma": "^6.19.3",
  "tsx": "^4.22.3",
  "typescript": "^6.0.3"
}
```

Si Prisma 7 est installé par erreur, revenir à Prisma 6 :

```bash
npm uninstall prisma @prisma/client
npm install @prisma/client@6.19.3
npm install -D prisma@6.19.3
```

Vérifier la version :

```bash
npx prisma -v
```

---

## 4. Protéger le fichier `.env`

Le fichier `.env` contient des informations sensibles. Il ne doit jamais être envoyé sur GitHub.

Créer un fichier `.gitignore` à la racine :

```gitignore
node_modules
.env
dist
```

---

## 5. Créer le fichier `.env`

Créer un fichier `.env` à la racine du projet :

```env
PORT=3000
DATABASE_URL="votre_url_neon"
JWT_SECRET="votre_secret_jwt"
```

Exemple :

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="secret_genere"
```

Ne jamais partager la vraie valeur de `DATABASE_URL` ou `JWT_SECRET`.

---

## 6. Générer un JWT_SECRET

Pour générer une clé secrète JWT sécurisée :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier la valeur générée dans `.env` :

```env
JWT_SECRET="valeur_generee"
```

Important :

- `JWT_SECRET` n’est pas le token JWT.
- `JWT_SECRET` est la clé secrète côté serveur.
- Le vrai token JWT sera généré au login avec `jwt.sign`.

Un vrai JWT ressemble à :

```txt
header.payload.signature
```

Il contient trois parties séparées par deux points.

---

## 8. Config TypeScript recommandée

Si le projet a des erreurs sur les imports Express/CORS, utiliser cette configuration dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

Si VS Code affiche encore des erreurs :

```txt
Cmd + Shift + P
TypeScript: Restart TS Server
```

ou :

```txt
Developer: Reload Window
```

---

## 9. Structure du projet

Structure recommandée :

```txt
template-api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts
│   ├── router/
│   │   ├── cats.ts
│   │   └── users.ts
│   └── middlewares/
│       └── authBearer.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 10. Fichier `src/index.ts`

Exemple de base :

```ts
import cors from "cors";
import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { catRouter } from "./router/cats";
import { userRouter } from "./router/users";

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.json({ message: "MiaouHotel API fonctionne" });
});

apiRouter.use("/auth", userRouter);
apiRouter.use("/cats", catRouter);

app.use("/api", apiRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MiaouHotel API lancée sur le port ${PORT}`);
});
```

---

## 11. Schéma Prisma de base

Fichier :

```txt
prisma/schema.prisma
```

Exemple :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  firstname String
  email     String   @unique
  password  String
  cats      Cat[]
  createdAt DateTime @default(now())
}

model Cat {
  id        Int      @id @default(autoincrement())
  name      String
  age       Int?
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## 12. Commandes Prisma importantes

### Générer Prisma Client

```bash
npx prisma generate
```

Cette commande génère le client Prisma utilisé dans le code TypeScript.

---

### schema.prisma → Neon
```bash
npx prisma migrate dev
```

### Neon → schema.prisma
```bash
npx prisma db pull
```


### Créer et appliquer une migration

```bash
npx prisma migrate dev --name init
```

Cette commande :

1. lit `schema.prisma`,
2. crée une migration SQL,
3. applique la migration à la base PostgreSQL / Neon,
4. génère Prisma Client.

---

### Ouvrir Prisma Studio

```bash
npx prisma studio
```

Prisma Studio permet de visualiser et modifier les données de la base.

---

### Vérifier l’état des migrations

```bash
npx prisma migrate status
```

---

### Réinitialiser la base en développement

Attention : cette commande supprime les données.

```bash
npx prisma migrate reset
```

---

## 13. Lancer le projet

```bash
npm run dev
```

Le script attendu dans `package.json` :

```json
"scripts": {
  "dev": "tsx src/index.ts"
}
```

Tester l’API :

```txt
http://localhost:3000/api
```



## 14. Commandes utiles résumé

```bash
npm install
npm run dev
npx prisma -v
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
npx prisma migrate status
npx prisma migrate reset
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
