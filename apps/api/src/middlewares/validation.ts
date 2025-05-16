import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ResponseService from "../services/response.service";

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseService.validationError(
      res,
      "invalid request",
      errors.array()
    );
  }
  next();
}
