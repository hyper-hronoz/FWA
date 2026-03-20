import { body } from "express-validator/lib/middlewares/validation-chain-builders";

// ======================
// CREATE GIRL VALIDATION
// ======================
export const createGirlValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Имя неверное"),

  body("age")
    .notEmpty()
    .withMessage("Age is required")
    .isInt({ min: 18, max: 100 })
    .withMessage("Только старше 18"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Описание от 10 до 500 символов"),

  body("video_url")
    .optional()
    .isURL()
    .withMessage("Некорректная ссылка"),
];