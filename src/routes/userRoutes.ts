import { Router } from "express";
import { likeGirl, getLikedGirls } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Все маршруты защищены JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Лайки и просмотр тянок
 */

/**
 * @swagger
 * /user/like:
 *   post:
 *     summary: Поставить лайк тянке
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               girlId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Лайк поставлен
 */
router.post("/like", likeGirl);


/**
 * @swagger
 * /user/likes:
 *   get:
 *     summary: Список всех лайкнутых тянок
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Массив лайкнутых тянок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   video_url:
 *                     type: string
 */
router.get("/likes", getLikedGirls);

export default router;