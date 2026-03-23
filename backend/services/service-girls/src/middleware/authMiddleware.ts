import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator/lib/validation-result";

import jwt from "jsonwebtoken";
import { db } from "../db/db";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "SECRET_KEY";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: "No user in token" });
  }

  try {
    const [rows]: any = await db.query(
      "SELECT is_admin FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!rows[0].is_admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};
