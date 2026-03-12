import { Router } from "express";
import { 
  getUnlikedGirls, 
  getAllGirls, 
  createGirl, 
  updateGirl 
} from "../controllers/girlController";
import { authMiddleware, validate } from "../middleware/authMiddleware";
import { createGirlValidation } from "../validation/girlValidation";

const router = Router();

// Все маршруты защищены JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Girls
 *   description: Управление тянками
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
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Asuna"
 *                   age:
 *                     type: integer
 *                     example: 18
 *                   description:
 *                     type: string
 *                     example: "Любит аниме и приключения"
 *                   video_url:
 *                     type: string
 *                     example: "/videos/asuna.mp4"
 */
router.get("/unliked", getUnlikedGirls);

/**
 * @swagger
 * /girls/all:
 *   get:
 *     summary: Получить список всех девушек
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Массив всех тянок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Asuna"
 *                   age:
 *                     type: integer
 *                     example: 18
 *                   description:
 *                     type: string
 *                     example: "Любит аниме и приключения"
 *                   video_url:
 *                     type: string
 *                     example: "/videos/asuna.mp4"
 */
router.get("/all", getAllGirls);

/**
 * @swagger
 * /girls/create:
 *   post:
 *     summary: Создать новую тянку
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Данные новой тянки
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Asuna"
 *               age:
 *                 type: integer
 *                 example: 18
 *               description:
 *                 type: string
 *                 example: "Любит аниме и приключения"
 *               video_url:
 *                 type: string
 *                 example: "/videos/asuna.mp4"
 *     responses:
 *       200:
 *         description: Тянка создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Girl created"
 */
router.post("/create", createGirlValidation, validate, createGirl);

/**
 * @swagger
 * /girls/update/{id}:
 *   put:
 *     summary: Обновить информацию о тянке
 *     tags: [Girls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID тянки для обновления
 *     requestBody:
 *       description: Поля тянки для обновления
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Asuna Updated"
 *               age:
 *                 type: integer
 *                 example: 19
 *               description:
 *                 type: string
 *                 example: "Любит аниме и приключения, обновлено"
 *               video_url:
 *                 type: string
 *                 example: "/videos/asuna_updated.mp4"
 *     responses:
 *       200:
 *         description: Тянка обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Girl updated"
 */
router.put("/update/:id", updateGirl);

export default router;