import { Request, Response, NextFunction } from "express";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Routes publiques QCM : GET /api/qcms et GET /api/qcms/:id
  if (req.method === "GET") {
    return next();
  }

  const authorization = req.headers.authorization;
  const authServiceUrl =
    process.env.AUTH_SERVICE_URL || "http://localhost:3002";

  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const response = await fetch(`${authServiceUrl}/users/me`, {
      method: "GET",
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await response.json();

    req.headers["x-user-id"] = String(user.id);

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
