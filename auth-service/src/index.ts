import express from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./router/auths";
import { userRouter } from "./router/users";

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

apiRouter.use("/auth/local", authRouter);
apiRouter.use("/users", userRouter);

app.use("", apiRouter);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Auth API est en cours d'exécution sur le port ${PORT}`);
});
