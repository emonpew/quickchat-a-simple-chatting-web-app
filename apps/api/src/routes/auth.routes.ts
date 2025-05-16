// src/routes/auth.routes.ts
import { Router, Request, Response } from "express";
import {
  registerController,
  loginController,
} from "@/controllers/auth.controller";
import { authValidator } from "../validators/auth.validator";
import { handleValidationErrors } from "@/middlewares/validation";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

router.post(
  "/register",
  authValidator.create,
  handleValidationErrors,
  registerController
);

router.post(
  "/login",
  authValidator.create,
  handleValidationErrors,
  loginController
);

router.get("/verify", authenticate, (req: Request, res: Response) => {
  res.json({
    userId: req.user!.id,
    username: req.user!.username,
  });
});

export default router;
