import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No auth header" });

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
