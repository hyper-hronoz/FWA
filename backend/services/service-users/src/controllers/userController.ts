import { Request, Response } from "express";
import { db } from "../db/db";
import bcrypt from "bcrypt";

const mapUserRow = (row: any) => ({
  id: String(row.id),
  username: row.username,
  email: row.email,
  age: row.age,
  avatar: row.avatar ?? undefined,
  createdAt: row.createdAt ?? undefined,
  is_admin: Boolean(row.is_admin),
});

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, age FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows]: any = await db.query(
      "SELECT id, username, email, age, avatar, createdAt, is_admin FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { username, email, password, age } = req.body;

  try {
    const hash = password ? await bcrypt.hash(password, 10) : undefined;

    await db.query(
      `UPDATE users SET 
        username = COALESCE(?, username),
        email = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        age = COALESCE(?, age)
      WHERE id = ?`,
      [username, email, hash, age, userId]
    );

    res.json({ message: "User updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { username, email, password, age } = req.body;

  try {
    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username || email) {
      const [duplicates]: any = await db.query(
        `SELECT id
         FROM users
         WHERE id <> ?
           AND (username = COALESCE(?, username) OR email = COALESCE(?, email))
         LIMIT 1`,
        [userId, username ?? null, email ?? null]
      );

      if (duplicates[0]) {
        return res.status(409).json({ message: "Username or email already taken" });
      }
    }

    const hash = password ? await bcrypt.hash(password, 10) : null;

    await db.query(
      `UPDATE users SET 
        username = COALESCE(?, username),
        email = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        age = COALESCE(?, age)
      WHERE id = ?`,
      [username ?? null, email ?? null, hash, age ?? null, userId]
    );

    const [updatedRows]: any = await db.query(
      "SELECT id, username, email, age, avatar, createdAt, is_admin FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    res.json(mapUserRow(updatedRows[0]));
  } catch (err: any) {
    console.error(err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username or email already taken" });
    }
    res.status(500).json({ message: "Database error" });
  }
};

export const logOut = (req: Request, res: Response) => {
  res.json({ message: "Logged out. Delete token on client." });
};
