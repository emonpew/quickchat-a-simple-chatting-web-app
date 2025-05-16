import WebSocket from "ws";
import wsService from "../../services/ws.service";
import prisma from "@/utils/prisma";
import { ChatMessagePayload, TypingIndicatorPayload } from "@/types/socket";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/utils/config";

// Environment variables

export const handleChatMessage = async (
  ws: WebSocket,
  payload: ChatMessagePayload,
  senderId: number
) => {
  try {
    // 1. Verify JWT token
    // const decoded = jwt.verify(payload.token, JWT_SECRET) as { id: number };
    // const senderId = decoded.id;

    // console.log(senderId);
    // 2. Validate room existence and participant status
    const room = await prisma.chatRoom.findUnique({
      where: {
        id: payload.roomId,
        OR: [{ user1Id: senderId }, { user2Id: senderId }],
      },
    });

    if (!room) {
      throw new Error(
        "Unauthorized: You are not a participant in this chat room"
      );
    }

    // 3. Save message to database
    const message = await prisma.message.create({
      data: {
        content: payload.content,
        senderId: senderId,
        receiverId: senderId === room.user1Id ? room.user2Id : room.user1Id,
        roomId: room.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    // Update ChatRoom's updatedAt
    await prisma.chatRoom.update({
      where: { id: message.roomId },
      data: { updatedAt: new Date() }, // Force update
    });

    wsService.broadcastToRoom(room.id, message.content, [message.senderId]);
  } catch (error) {
    console.error("Message handling error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        payload: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to process message",
        },
      })
    );
  }
};

export const handleTypingIndicator = async (
  ws: WebSocket,
  payload: TypingIndicatorPayload,
  senderId: number
) => {
  try {
    // Verify JWT token
    // const decoded = jwt.verify(payload.token, JWT_SECRET) as { userId: number };
    // const senderId = decoded.userId;

    // Validate room participation
    const room = await prisma.chatRoom.findUnique({
      where: {
        id: payload.roomId,
        OR: [{ user1Id: senderId }, { user2Id: senderId }],
      },
    });

    if (!room) {
      throw new Error("Unauthorized: Invalid room access");
    }

    // Broadcast typing indicator to other participant
    wsService.broadcastToRoom(
      room.id,
      JSON.stringify({
        type: "typing",
        payload: {
          roomId: room.id,
          userId: senderId,
          isTyping: payload.isTyping,
        },
      })[senderId] // Exclude the sender from receiving their own typing indicator
    );
  } catch (error) {
    console.error("Typing indicator error:", error);
  }
};
