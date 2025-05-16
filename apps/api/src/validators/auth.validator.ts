// src/validators/auth.validator.ts
import { body } from "express-validator";

export const authValidator = {
  create: [
    body("username").isString().notEmpty().withMessage("username is required"),
    body("password").isString().notEmpty().withMessage("password is required"),
  ],
};
