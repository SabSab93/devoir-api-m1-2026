import { Router, Request, Response } from "express";
import { authBearer } from "../middlewares/authBearer";

export const userRouter = Router();

userRouter.get(
  "/me",
  authBearer,
  async (req: Request & { user?: any }, res: Response) => {
    console.log("User info from token:", req.user);
    return res.json(req.user);
  },
);
