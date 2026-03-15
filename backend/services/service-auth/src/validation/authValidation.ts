import { body } from "express-validator/lib/middlewares/validation-chain-builders";


export const registerValidation = [
  body("username")
    .isString().withMessage("Username must be a string")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"),
  body("email")
    .isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("age")
    .isInt({ min: 18, max: 120 }).withMessage("Age must be between 13 and 120"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").exists().withMessage("Password is required"),
];