import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import type {AuthResponse} from "../shared/Auth"
import { User } from "../shared/Profile";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "SECRET_KEY";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "REFRESH_SECRET_KEY";
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

const signAccessToken = (user: { id: number; email: string }) =>
  jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (user: { id: number; email: string }) =>
  jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, age } = req.body;

    const [existingUsers]: any = await db.query(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      "INSERT INTO users (username,email,password_hash,age) VALUES (?,?,?,?)",
      [username, email, hash, age]
    );

    const createdUser = {
      id: result.insertId as number,
      email,
    };

    const accessToken = signAccessToken(createdUser);
    const refreshToken = signRefreshToken(createdUser);
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [createdUser.id, refreshToken]
    );

    const safeUser: User = {
      id: String(createdUser.id),
      email,
      username,
      age,
      avatar: undefined,
      createdAt: new Date().toISOString(),
      is_admin: false,
    };

    const response: AuthResponse = {
      user: safeUser,
      accessToken,
      refreshToken,
    };

    return res.status(201).json(response);
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE email=?",
    [email]
  );

  const user = rows[0];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await db.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
    [user.id, refreshToken]
  );

  const safeUser: User = {
    id: String(user.id),
    email: user.email,
    username: user.username,
    age: user.age,
    avatar: user.avatar ?? null,
    createdAt: user.createdAt ?? new Date().toISOString(),
    is_admin: Boolean(user.is_admin),
  };
  const response: AuthResponse = {
    user: safeUser,
    accessToken,
    refreshToken,
  };

  return res.json(response);
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [rows]: any = await db.query(
      "SELECT id, username, email, age, avatar, createdAt, is_admin FROM users WHERE id = ?",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const [rows]: any = await db.query(
      "SELECT user_id FROM refresh_tokens WHERE token = ? AND revoked = 0 AND expires_at > NOW()",
      [refreshToken]
    );

    if (!rows[0]) {
      return res.status(403).json({ message: "Refresh token is invalid or expired" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: number; email: string };
    const payload = { id: decoded.id, email: decoded.email };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    await db.query("UPDATE refresh_tokens SET revoked = 1 WHERE token = ?", [refreshToken]);
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [decoded.id, newRefreshToken]
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db.query("UPDATE refresh_tokens SET revoked = 1 WHERE token = ?", [refreshToken]);
  }
  return res.json({ message: "Logged out successfully" });
};