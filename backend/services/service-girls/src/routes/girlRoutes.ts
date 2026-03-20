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
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество элементов на странице
 *     responses:
 *       200:
 *         description: Список всех девушек с пагинацией
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       age:
 *                         type: integer
 *                       bio:
 *                         type: string
 *                       video:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       interests:
 *                         type: json
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Ошибка базы данных
 */
router.get("/all", getAllGirls);


/**
 * @swagger
 * /girls/unliked:
 *   get:
 *     summary: Получить девушек, которых пользователь еще не оценивал
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество элементов на странице
 *     responses:
 *       200:
 *         description: Список неоцененных девушек
 *       500:
 *         description: Ошибка базы данных
 */
router.get("/unliked", getUnlikedGirls);

/**
 * @swagger
 * /girls/create:
 *   post:
 *     summary: Создать новую девушку (только для админа)
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - age
 *               - description
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Мику"
 *               age:
 *                 type: integer
 *                 example: 18
 *               description:
 *                 type: string
 *                 example: "Люблю петь и играть на синтезаторе!"
 *               video_url:
 *                 type: string
 *                 example: "/videos/miku.mp4"
 *               interests:
 *                 type: string
 *                 example: '["Музыка", "Аниме"]'
 *     responses:
 *       200:
 *         description: Девушка создана
 *       500:
 *         description: Ошибка базы данных
 */
router.post("/create", createGirlValidation, validate, createGirl);

/**
 * @swagger
 * /girls/update/{id}:
 *   put:
 *     summary: Обновить данные девушки (только для админа)
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID девушки
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *               video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Девушка обновлена
 *       500:
 *         description: Ошибка базы данных
 */
router.put("/update/:id", updateGirl);

/**
 * @swagger
 * /girls/{id}/like:
 *   post:
 *     summary: Поставить лайк девушке
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID девушки
 *     responses:
 *       200:
 *         description: Лайк поставлен
 *       500:
 *         description: Ошибка базы данных
 */
router.post("/:id/like", likeGirl);

/**
 * @swagger
 * /girls/{id}/dislike:
 *   post:
 *     summary: Поставить дизлайк девушке
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID девушки
 *     responses:
 *       200:
 *         description: Дизлайк поставлен
 *       500:
 *         description: Ошибка базы данных
 */
router.post("/:id/dislike", dislikeGirl);

/**
 * @swagger
 * /girls/liked:
 *   get:
 *     summary: Получить всех девушек, которым пользователь поставил лайк
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список лайкнутых девушек
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   bio:
 *                     type: string
 *                   video:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   interests:
 *                     type: json
 *       500:
 *         description: Ошибка базы данных
 */
router.get("/liked", getLikedGirls);

/**
 * @swagger
 * /girls/{id}/unlike:
 *   delete:
 *     summary: Убрать лайк/дизлайк с девушки
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID девушки
 *     responses:
 *       200:
 *         description: Оценка удалена
 *       500:
 *         description: Ошибка базы данных
 */
router.delete("/:id/unlike", unlikeGirl);

export default router;