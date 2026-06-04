import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";
import { Router } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const authRouter = Router();

authRouter.post("/local/register", async (req, res) => {
  const { motdepasse, pseudo } = req.body.data;

  if (!motdepasse || !pseudo) {
    return res.status(400).json({
      message: "Pseudo et mot de passe obligatoires",
    });
  }

  const userWithpseudo = await prisma.user.findUnique({ where: { pseudo } });

  if (userWithpseudo) {
    res.status(200).json("Pseudo et mot de passe obligatoires invalide");
  } else {
    const hashedmotdpasse = await bcrypt.hash(
      motdepasse,
      parseInt(process.env.SALT_ROUNDS!),
    );

    const newUser = await prisma.user.create({
      data: {
        pseudo,
        motdepasse: hashedmotdpasse,
      },
    });
    res.status(201).json(newUser);
  }
});

authRouter.post("/local", async (req, res) => {
  const { pseudo, motdpasse } = req.body;
  const userWithpseudo = await prisma.user.findFirst({ where: { pseudo } });
  if (!userWithpseudo) {
    res.status(400).json("pseudo is incorrect");
  } else {
    const ismotdpasseCorrect = await bcrypt.compare(
      motdpasse,
      userWithpseudo.motdpasse,
    );
    if (ismotdpasseCorrect) {
      const token = jwt.sign(userWithpseudo, process.env.JWT_SECRET!);
      res.json({
        token,
        ...userWithpseudo,
      });
    } else {
      res.status(400).json("motdpasse is incorrect");
    }
  }
});
