import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import "dotenv/config";
import { Router } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const authRouter = Router();

authRouter.post("/local/register", async (req, res) => {
  try {
    const { pseudo, motdepasse } = req.body.data;

    if (!pseudo || !motdepasse) {
      return res.status(400).json({
        message: "Pseudo et mot de passe obligatoires",
      });
    }

    const userWithpseudo = await prisma.user.findUnique({ where: { pseudo } });

    if (userWithpseudo) {
      res.status(400).json("Pseudo et mot de passe obligatoires invalide");
    } else {
      const hashedmotdpasse = await argon2.hash(motdepasse);

      const newUser = await prisma.user.create({
        data: {
          pseudo,
          motdepasse: hashedmotdpasse,
        },
      });
      res.status(201).json({
        message: "Utilisateur créé",
        newUser,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

authRouter.post("/", async (req, res) => {
  try {
    const { pseudo, motdepasse } = req.body.data;

    if (!pseudo || !motdepasse) {
      return res.status(400).json({
        message: "Pseudo et mot de passe obligatoires",
      });
    }

    const userWithpseudo = await prisma.user.findUnique({ where: { pseudo } });
    if (!userWithpseudo) {
      return res.status(401).json({
        message: "Identifiantsou mtp incorrects",
      });
    }

    const ismotdpasseCorrect = await argon2.verify(
      userWithpseudo.motdepasse,
      motdepasse,
    );
    if (!ismotdpasseCorrect) {
      return res.status(401).json({
        message: "Identifiants ou mtp incorrects",
      });
    }

    const token = jwt.sign(userWithpseudo, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
