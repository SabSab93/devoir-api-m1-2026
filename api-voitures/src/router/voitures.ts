import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();

export const voituresRouter = Router();

voituresRouter.get("/", async (req, res) => {
  try {
    const voitures = await prisma.voiture.findMany();
    res.json(voitures);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

voituresRouter.get("/:id", async (req, res) => {
  try {
    const voitureId = parseInt(req.params.id);

    if (isNaN(voitureId)) {
      return res.status(400).json({ message: "Invalid voiture ID" });
    }

    const voiture = await prisma.voiture.findUnique({
      where: { id: voitureId },
    });

    if (!voiture) {
      return res.status(404).json({ message: "Voiture not found" });
    }

    res.json(voiture);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

voituresRouter.post("/", async (req, res) => {
  try {
    const { name, price } = req.body.data;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    const voiture = await prisma.voiture.create({
      data: {
        name,
        price,
      },
    });

    res.status(201).json({ message: "Creation voiture", voiture });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

voituresRouter.put("/:id", async (req, res) => {
  try {
    const voitureId = parseInt(req.params.id);

    if (isNaN(voitureId)) {
      return res.status(400).json({ message: "Invalid voiture ID" });
    }

    const voiture = await prisma.voiture.findUnique({
      where: { id: voitureId },
    });

    if (!voiture) {
      return res.status(404).json({ message: "Voiture not found" });
    }

    const { name, price } = req.body.data;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    const updatedvoiture = await prisma.voiture.update({
      where: { id: voitureId },
      data: {
        name,
        price,
      },
    });

    res.status(200).json(updatedvoiture);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

voituresRouter.delete("/:id", async (req, res) => {
  try {
    const voitureId = parseInt(req.params.id);

    if (isNaN(voitureId)) {
      return res.status(400).json({ message: "Invalid voiture ID" });
    }

    const voiture = await prisma.voiture.findUnique({
      where: { id: voitureId },
    });

    if (!voiture) {
      return res.status(404).json({ message: "Voiture not found" });
    }

    await prisma.voiture.delete({
      where: { id: voitureId },
    });

    res.json({ message: "Voiture deleted" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
