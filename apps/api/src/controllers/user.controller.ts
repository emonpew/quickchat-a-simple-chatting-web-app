import ResponseService from "@/services/response.service";
import prisma from "@/utils/prisma";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      omit: {
        password: true,
        createdAt: true,
      },
    });
    return res.json(users);
  } catch (error: any) {
    return ResponseService.internalServerError(res);
  }
};
