import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";
import { Router } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const authRouter = Router();

authRouter.post("/local/register", async (req, res) => {
    const { motdpasse, pseudo } = req.body;
    const userWithpseudo = await prisma.user.findFirst({ where: { pseudo } });
    if (userWithpseudo) {
        res.status(400).json("pseudo already exists");
    }
    else {
        const hashedmotdpasse = await bcrypt.hash(motdpasse, parseInt(process.env.SALT_ROUNDS!));
        const newUser = await prisma.user.create({ 
            data: {
                motdpasse: hashedmotdpasse, 
                pseudo
            } 
            });
        res.json(newUser);
    }
});

authRouter.post("/local", async (req, res) => {
    const { pseudo, motdpasse } = req.body;
    const userWithpseudo = await prisma.user.findFirst({ where: { pseudo } });
    if (!userWithpseudo) {
        res.status(400).json("pseudo is incorrect");
    }
    else {
        const ismotdpasseCorrect = await bcrypt.compare(motdpasse, userWithpseudo.motdpasse);
        if (ismotdpasseCorrect) {
            const token = jwt.sign(userWithpseudo, process.env.JWT_SECRET!);
            res.json({
                token,
                ...userWithpseudo
            });
        }
        else {
            res.status(400).json("motdpasse is incorrect");
        }
    }
})