import { Request, Response } from "express";
import { db } from "../db/db";

// Получить список всех тян, которых ещё не лайкнул пользователь
export const getUnlikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.age, g.description, g.video_url
       FROM girls g
       LEFT JOIN user_girl_likes l
       ON g.id = l.girl_id AND l.user_id = ?
       WHERE l.user_id IS NULL OR l.status != 'liked'`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Получить всех тянок
export const getAllGirls = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM girls");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Создать новую тянку
export const createGirl = async (req: Request, res: Response) => {
  const { name, age, description, video_url } = req.body;
  try {
    await db.query(
      "INSERT INTO girls (name, age, description, video_url) VALUES (?, ?, ?, ?)",
      [name, age, description, video_url]
    );
    res.json({ message: "Girl created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Изменение тянки
export const updateGirl = async (req: Request, res: Response) => {
  const girlId = req.params.id;
  const { name, age, description, video_url } = req.body;

  try {
    await db.query(
      `UPDATE girls SET
        name = COALESCE(?, name),
        age = COALESCE(?, age),
        description = COALESCE(?, description),
        video_url = COALESCE(?, video_url)
       WHERE id = ?`,
      [name, age, description, video_url, girlId]
    );
    res.json({ message: "Girl updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};