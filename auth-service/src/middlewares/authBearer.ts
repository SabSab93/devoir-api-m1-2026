import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authBearer = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [typeToken, token] = authorization.split(" ");

    if (typeToken !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
    };

    (req as any).user = decoded;

    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};