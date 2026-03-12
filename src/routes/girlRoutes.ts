import { Router } from "express";
import { getUnlikedGirls } from "../controllers/girlController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Все маршруты защищены JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Girls
 *   description: Обработка тянок
 */

/**
 * @swagger
 * /girls/unliked:
 *   get:
 *     summary: Список девушек, которых ещё не лайкнул пользователь
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Массив девушек
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
router.get("/unliked", (request, response) => {
    getUnlikedGirls(request ,response)
});

export default router;