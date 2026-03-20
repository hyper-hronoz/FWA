import { Router } from "express";
import {
  getUnlikedGirls,
  getAllGirls,
  createGirl,
  updateGirl,
  dislikeGirl,
  getLikedGirls,
  unlikeGirl,
  likeGirl,
} from "../controllers/girlController";

import { authMiddleware, validate } from "../middleware/authMiddleware";
import { createGirlValidation } from "../validation/girlValidation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Girl
 *   description: Тяночки и работа с ними
 */

router.use(authMiddleware);

/**
 * @swagger
 * /girls/all:
 *   get:
 *     summary: Получить всех девушек
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Кол-во элементов на странице
 */
router.get("/all", getAllGirls);


/**
 * @swagger
 * /girls/all:
 *   get:
 *     summary: Получить всех девушек (с пагинацией)
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Кол-во элементов на странице
 */
router.get("/unliked", getUnlikedGirls);

/**
 * @swagger
 * /girls/create:
 *   post:
 *     summary: Создать девушку
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Anna
 *               age:
 *                 type: integer
 *                 example: 22
 *               description:
 *                 type: string
 *                 example: Beautiful girl
 *               video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Girl created
 */
router.post("/create", createGirlValidation, validate, createGirl);

/**
 * @swagger
 * /girls/create:
 *   post:
 *     summary: Создать девушку
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Anna
 *               age:
 *                 type: integer
 *                 example: 22
 *               description:
 *                 type: string
 *                 example: Beautiful girl
 *               video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Girl created
 */
router.put("/update/:id", updateGirl);

/**
 * @swagger
 * /girls/{id}/like:
 *   post:
 *     summary: Лайкнуть девушку
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liked successfully
 */
router.post("/:id/like", likeGirl);

/**
 * @swagger
 * /girls/{id}/like:
 *   post:
 *     summary: Лайкнуть девушку
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liked successfully
 */
router.post("/:id/dislike", dislikeGirl);

/**
 * @swagger
 * /girls/{id}/dislike:
 *   post:
 *     summary: Дизлайкнуть девушку
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disliked successfully
 */
router.get("/liked", getLikedGirls);

/**
 * @swagger
 * /girls/liked:
 *   get:
 *     summary: Получить лайкнутых девушек
 *     tags: [Girl]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список лайкнутых девушек
 */
router.delete("/:id/unlike", unlikeGirl);

export default router;