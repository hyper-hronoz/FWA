import { Request, Response } from "express";
import { db } from "../db/db";
import { RowDataPacket } from "mysql2";

// ======================
// GET ALL GIRLS (pagination)
// ======================
export const getAllGirls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, age, description, video_url
       FROM girls
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM girls`
    );

    const total = countResult[0].total;

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// ======================
// GET UNLIKED GIRLS (pagination)
// ======================
export const getUnlikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT g.id, g.name, g.age, g.description, g.video_url
       FROM girls g
       WHERE NOT EXISTS (
         SELECT 1
         FROM user_girl_likes l
         WHERE l.girl_id = g.id
           AND l.user_id = ?
       )
       ORDER BY g.id ASC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM girls g
       WHERE NOT EXISTS (
         SELECT 1
         FROM user_girl_likes l
         WHERE l.girl_id = g.id
           AND l.user_id = ?
       )`,
      [userId]
    );

    const total = countResult[0].total;

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// ======================
// CREATE GIRL
// ======================
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

// ======================
// UPDATE GIRL
// ======================
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

// ======================
// LIKE GIRL
// ======================
export const likeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const girlId = req.params.id;

  try {
    await db.query(
      `INSERT INTO user_girl_likes (user_id, girl_id, status)
       VALUES (?, ?, 'liked')
       ON DUPLICATE KEY UPDATE status = 'liked'`,
      [userId, girlId]
    );

    res.json({ message: "Liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// ======================
// DISLIKE GIRL
// ======================
export const dislikeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const girlId = req.params.id;

  try {
    await db.query(
      `INSERT INTO user_girl_likes (user_id, girl_id, status)
       VALUES (?, ?, 'disliked')
       ON DUPLICATE KEY UPDATE status = 'disliked'`,
      [userId, girlId]
    );

    res.json({ message: "Disliked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// ======================
// GET LIKED GIRLS
// ======================
export const getLikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT g.id, g.name, g.age, g.description, g.video_url
       FROM girls g
       JOIN user_girl_likes l ON l.girl_id = g.id
       WHERE l.user_id = ?
         AND l.status = 'liked'`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// ======================
// UNLIKE GIRL
// ======================
export const unlikeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const girlId = req.params.id;

  try {
    await db.query(
      `DELETE FROM user_girl_likes
       WHERE user_id = ? AND girl_id = ?`,
      [userId, girlId]
    );

    res.json({ message: "Unliked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};