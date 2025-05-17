import ResponseService from "@/services/response.service";
import wsService from "@/services/ws.service";
import prisma from "@/utils/prisma";
import { Request, Response } from "express";

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const chatRoom = await prisma.chatRoom.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    const rooms = chatRoom.map((val) => {
      return {
        id: val.id,
        username:
          userId == val.user1Id ? val.user2.username : val.user1.username,
        lastmsg: val.messages.length != 0 ? val.messages[0].content : "",
      };
    });
    return res.json(rooms);
  } catch (error: any) {
    return ResponseService.internalServerError(res);
  }
};

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.id);
    const userId = req.user!.id;

    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { id: roomId },
          { OR: [{ user1Id: userId }, { user2Id: userId }] },
        ],
      },
    });
    if (!chatRoom) {
      return ResponseService.unauthorized(
        res,
        "chat not exists or not allowed to view chat"
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(messages);
  } catch (error: any) {
    return ResponseService.internalServerError(res);
  }
};

export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const { recieverId }: { recieverId: number } = req.body;
    if (!recieverId && typeof recieverId != "number") {
      return ResponseService.badRequest(
        res,
        "recieverId is not given or invalid"
      );
    }
    const senderId = req.user!.id;
    const senderName = req.user!.username;
    const room = await prisma.chatRoom.create({
      data: {
        user1Id: senderId,
        user2Id: recieverId,
      },
      include: {
        user2: true,
      },
    });
    const msgToSender = {
      id: room.id,
      lastmsg: "",
      username: room.user2.username,
    };
    const msgToReciever = {
      id: room.id,
      lastmsg: "",
      username: senderName,
    };
    wsService.sendToUser(
      senderId,
      JSON.stringify({
        type: "chatroom_add",
        payload: msgToSender,
      })
    );

    wsService.sendToUser(
      recieverId,
      JSON.stringify({
        type: "chatroom_add",
        payload: msgToReciever,
      })
    );

    return ResponseService.created(res, "chatroom");
  } catch (error: any) {
    return ResponseService.internalServerError(res);
  }
};
