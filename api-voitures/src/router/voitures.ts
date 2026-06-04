import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { checkToken } from "../middlewares/checkToken";

const prisma = new PrismaClient();

export const voituresRouter = Router();

voituresRouter.get("/get-all", async (req, res) => {
    const voitures = await prisma.voiture.findMany();
    res.json(voitures);
});

voituresRouter.get("/get-this-one", async (req, res) => {
    const id = parseInt(req.query.id as string);
    const voiture = await prisma.voiture.findFirst({ where: { id: id } });
    res.json(voiture);
});

voituresRouter.post("/create", checkToken, async (req, res) => {
    const { name, price } = req.body.data;
    if(!name || !price){
        res.status(400).send("Missing required information");
    }
    else {
        const newVoiture = await prisma.voiture.create({
            data: {
                name, 
                price
            }
        });
        res.json(newVoiture);
    }
});

voituresRouter.patch("/update/:id", checkToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price } = req.body.data;
    const actual = await prisma.voiture.findFirst({ where: { id: id } });
    if (actual) {
        const updatedVoiture = await prisma.voiture.update({
            where: { id: id },
            data: {
                name: name || actual.name,
                price: price || actual.price
            }
        });
        res.json(updatedVoiture);
    }
});

voituresRouter.delete("/delete", checkToken, async (req, res) => {
    const actual = await prisma.voiture.findFirst({ where: { id: parseInt(req.query.id as string) } });
    if (actual) {
        await prisma.voiture.delete({ where: { id: parseInt(req.query.id as string) } });
        res.json(actual);
    }
    else {
        res.status(404).send("Voiture not found");
    }
});