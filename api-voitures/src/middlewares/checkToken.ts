import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface DecodeToken {
  id: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export async function checkToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const basicAuth = req.headers.authorization;

  if (!basicAuth) {
    return res.status(401).send("No authorization provided");
  }

  const [typeToken, token] = basicAuth.split(" ");

  if (typeToken !== "Basic") {
    return res.status(401).send("Invalid auth type");
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");

    const [pseudo, password] = decoded.split(":");

    if (!pseudo || !password) {
      return res.status(401).send("Invalid credentials");
    }

    (req as any).username = pseudo;
    (req as any).email = password;

    next();
  } catch (e) {
    return res.status(401).send("Invalid basic token");
  }
}
