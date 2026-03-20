import { Request, Response } from "express";
import { db } from "../db/db";
import bcrypt from "bcrypt";


// Вывод всех пользователей
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, age FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Изменение пользователя
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

export const logOut = (req: Request, res: Response) => {
  res.json({ message: "Logged out. Delete token on client." });
};