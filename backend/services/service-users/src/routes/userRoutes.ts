import { Router } from "express";
import { 
  getAllUsers, 
  updateUser, 
  logOut 
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Все маршруты защищены JWT
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Управление пользователями и лайки тянок
 */



/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Массив всех пользователей
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
 *                   username:
 *                     type: string
 *                     example: "Otaku123"
 *                   email:
 *                     type: string
 *                     example: "otaku@mail.com"
 *                   age:
 *                     type: integer
 *                     example: 20
 */
router.get("/all", getAllUsers);

/**
 * @swagger
 * /user/update/{id}:
 *   put:
 *     summary: Обновить информацию о пользователе
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID пользователя для обновления
 *     requestBody:
 *       description: Поля пользователя, которые нужно обновить
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "OtakuPro"
 *               email:
 *                 type: string
 *                 example: "otaku2@mail.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               age:
 *                 type: integer
 *                 example: 21
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated"
 */
router.put("/update/:id", updateUser);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Выход пользователя (удаление токена на фронте)
 *     tags: [User]
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
router.post("/logout", logOut);

export default router;