import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import ResponseService from "@/services/response.service";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header or cookie
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return ResponseService.unauthorized(res);
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error) {
    return ResponseService.unauthorized(res);
  }
};
