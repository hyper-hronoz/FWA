import { Request, Response } from "express";
import { db } from "../db/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const shuffleArray = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const parseInterests = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const normalized = value.trim();
  if (!normalized) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    return normalized
      .split(/[\s,#]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeGirl = (row: RowDataPacket) => ({
  id: row.id,
  username: row.username,
  age: row.age,
  bio: row.bio ?? "",
  video: row.video ?? "",
  avatar: row.avatar ?? "",
  favoriteAnime: row.favoriteAnime ?? row.favorite_anime ?? "",
  interests: parseInterests(row.interests),
});

const fetchGirlById = async (id: number) => {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, username, age, bio, video, avatar, interests, favorite_anime AS favoriteAnime
     FROM girls
     WHERE id = ?`,
    [id]
  );

  return rows[0] ? normalizeGirl(rows[0]) : null;
};


export const getAllGirls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, username, age, bio, video, avatar, interests, favorite_anime AS favoriteAnime
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
      data: shuffleArray(rows.map(normalizeGirl)),
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
      `SELECT g.id, g.username, g.age, g.bio, g.video, g.avatar, g.interests, g.favorite_anime AS favoriteAnime
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

    const shuffledRows = rows.map(normalizeGirl);
    for (let i = shuffledRows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRows[i], shuffledRows[j]] = [shuffledRows[j], shuffledRows[i]];
    }

    res.json({
      data: shuffledRows,
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
  const { username, age, bio, favoriteAnime } = req.body;
  const avatar = req.files && !Array.isArray(req.files) ? req.files.avatar?.[0] : undefined;
  const video = req.files && !Array.isArray(req.files) ? req.files.video?.[0] : undefined;
  const parsedInterests = parseInterests(req.body.interests);

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO girls (username, age, bio, video, avatar, interests, favorite_anime)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        age,
        bio,
        video ? `/videos/${video.filename}` : null,
        avatar ? `/avatars/${avatar.filename}` : null,
        JSON.stringify(parsedInterests),
        favoriteAnime ?? "",
      ]
    );

    const createdGirl = await fetchGirlById(result.insertId);
    res.status(201).json(createdGirl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};


export const updateGirl = async (req: Request, res: Response) => {
  const girlId = Number(req.params.id);
  const { username, age, bio, favoriteAnime } = req.body;
  const avatar = req.files && !Array.isArray(req.files) ? req.files.avatar?.[0] : undefined;
  const video = req.files && !Array.isArray(req.files) ? req.files.video?.[0] : undefined;
  const parsedInterests = req.body.interests === undefined ? undefined : parseInterests(req.body.interests);

  try {
    await db.query(
      `UPDATE girls SET
        username = COALESCE(?, username),
        age = COALESCE(?, age),
        bio = COALESCE(?, bio),
        video = COALESCE(?, video),
        avatar = COALESCE(?, avatar),
        interests = COALESCE(?, interests),
        favorite_anime = COALESCE(?, favorite_anime)
       WHERE id = ?`,
      [
        username ?? null,
        age ?? null,
        bio ?? null,
        video ? `/videos/${video.filename}` : null,
        avatar ? `/avatars/${avatar.filename}` : null,
        parsedInterests ? JSON.stringify(parsedInterests) : null,
        favoriteAnime ?? null,
        girlId,
      ]
    );

    const updatedGirl = await fetchGirlById(girlId);

    if (!updatedGirl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json(updatedGirl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const deleteGirl = async (req: Request, res: Response) => {
  const girlId = Number(req.params.id);

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM girls WHERE id = ?",
      [girlId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json({ message: "Girl deleted" });
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
      `SELECT g.id, g.username, g.age, g.bio, g.video, g.avatar, g.interests, g.favorite_anime AS favoriteAnime
       FROM girls g
       JOIN user_girl_likes l ON l.girl_id = g.id
       WHERE l.user_id = ?
         AND l.liked = 1`,
      [userId]
    );
    res.json(rows.map(normalizeGirl));
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
