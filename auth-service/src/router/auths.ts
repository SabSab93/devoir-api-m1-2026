import { Router } from "express";
import { prisma } from "../index";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { pseudo, motdpasse } = req.body.data;

    if (!pseudo || !motdpasse) {
      return res.status(400).json({
        message: "Firstname, email et mot de passe obligatoires",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { pseudo },
    });

    if (existingUser) {
      return res.status(200).json({
        message:
          "Si les informations sont valides, votre demande sera traitée.",
      });
    }

    const hashedPassword = await argon2.hash(motdpasse);

    const user = await prisma.user.create({
      data: {
        pseudo,
        motdpasse: hashedPassword,
      },
    });

    res.status(201).json({
      message: "Utilisateur créé",
      data: {
        id: user.id,
        pseudo: user.pseudo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//login
authRouter.post("/", async (req, res) => {
  try {
    const { pseudo, motdpasse } = req.body.data;

    if (!pseudo || !motdpasse) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { pseudo },
    });

    if (!existingUser) {
      return res.status(401).json({
        message: "Identifiantsou mtp incorrects",
      });
    }

    const isPasswordValid = await argon2.verify(
      existingUser.motdpasse,
      motdpasse,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants ou mtp incorrects",
      });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.pseudo,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" },
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
