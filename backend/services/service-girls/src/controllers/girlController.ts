import { Request, Response } from "express";
import { db } from "../db/db";
import { RowDataPacket } from "mysql2";


export const getAllGirls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, username, age, bio, video, avatar, interests
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


export const getUnlikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT g.id, g.username, g.age, g.bio, g.video, g.avatar, g.interests
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


export const createGirl = async (req: Request, res: Response) => {
  const { username, age, description, video_url, interests } = req.body;

  try {
    await db.query(
      "INSERT INTO girls (username, age, bio, video, avatar, interests) VALUES (?, ?, ?, ?)",
      [username, age, description, video_url, interests]
    );

    res.json({ message: "Girl created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


export const updateGirl = async (req: Request, res: Response) => {
  const girlId = req.params.id;
  const { username, age, description, video_url } = req.body;

  try {
    await db.query(
      `UPDATE girls SET
        username = COALESCE(?, username),
        age = COALESCE(?, age),
        bio = COALESCE(?, bio),
        video = COALESCE(?, video)
       WHERE id = ?`,
      [username, age, description, video_url, girlId]
    );

    res.json({ message: "Girl updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


export const likeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const girlId = req.params.id;

  try {
    await db.query(
      `INSERT INTO user_girl_likes (user_id, girl_id, liked)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE liked = 1`,
      [userId, girlId]
    );

    res.json({ message: "Liked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


export const dislikeGirl = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const girlId = req.params.id;

  try {
    await db.query(
      `INSERT INTO user_girl_likes (user_id, girl_id, liked)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE liked = 0`,
      [userId, girlId]
    );

    res.json({ message: "Disliked" });
    console.log("Мы удаляем эту тянку",girlId);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


export const getLikedGirls = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT g.id, g.username, g.age, g.bio, g.video, g.avatar, g.interests
       FROM girls g
       JOIN user_girl_likes l ON l.girl_id = g.id
       WHERE l.user_id = ?
         AND l.liked = 1`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


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