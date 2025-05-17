import ResponseService from "@/services/response.service";
import prisma from "@/utils/prisma";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const users = await prisma.user.findMany({
      where: {
        // Exclude the current user
        id: { not: userId },
        // Exclude users who already have a chatroom with current user
        NOT: {
          OR: [
            { chatRoomsUser1: { some: { user1Id: userId } } },
            { chatRoomsUser1: { some: { user2Id: userId } } },
            { chatRoomsUser2: { some: { user1Id: userId } } },
            { chatRoomsUser2: { some: { user2Id: userId } } },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
      },
    });
    return res.json(users);
  } catch (error: any) {
    return ResponseService.internalServerError(res);
  }
};
