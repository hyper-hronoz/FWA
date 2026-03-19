import { body } from "express-validator/lib/middlewares/validation-chain-builders";


export const createGirlValidation = [
  body("name")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("age")
    .isInt({ min: 18, max: 120 }).withMessage("Age must be between 13 and 120"),
  body("description")
    .isString().withMessage("Description must be a string")
    .isLength({ max: 500 }).withMessage("Description max length 500 chars"),
  body("video_url")
    .optional()
    .isURL().withMessage("Video must be a valid URL"),
];