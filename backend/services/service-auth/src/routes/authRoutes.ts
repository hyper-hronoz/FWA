import { Router } from "express";
import { login, register, me, refresh, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Регистрация и вход пользователей
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация пользователя
*     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Пользователь создан
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Логин пользователя
*     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Возвращает JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/login", login);
router.post("/refresh", refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *       401:
 *         description: Нет токена или токен невалидный
 */

 router.get("/me", authMiddleware, me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя (удаление токена на фронте)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь успешно вышел
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out. Delete token on client."
 */
router.post("/logout", authMiddleware, logout);

export default router;