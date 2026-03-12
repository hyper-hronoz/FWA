import { Request, Response } from "express";
import { db } from "../db/db";

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