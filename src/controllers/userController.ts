import { Request, Response } from "express";
import { db } from "../db/db";
import bcrypt from "bcrypt";

// Поставить лайк
export const likeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id; // из JWT middleware
  const { girlId } = req.body;

  if (!girlId) return res.status(400).json({ message: "girlId required" });

  try {
    await db.query(
      `INSERT INTO user_girl_likes (user_id, girl_id, status) 
       VALUES (?, ?, 'liked')
       ON DUPLICATE KEY UPDATE status='liked'`,
      [userId, girlId]
    );

    res.json({ message: "Girl liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Просмотр всех лайкнутых девушек
export const getLikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.age, g.description
       FROM girls g
       JOIN user_girl_likes l ON g.id = l.girl_id
       WHERE l.user_id = ? AND l.status = 'liked'`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

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