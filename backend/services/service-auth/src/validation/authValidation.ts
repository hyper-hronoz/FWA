import { body } from "express-validator/lib/middlewares/validation-chain-builders";

export const registerValidation = [
  body("username")
    .isString()
    .isLength({ min: 3, max: 30 }),

  body("email")
    .isEmail(),

  body("password")
    .isLength({ min: 6 }),

  body("age")
    .isInt({ min: 18, max: 120 }),
];

export const loginValidation = [
  body("email").isEmail(),
  body("password").exists(),
];