import {
  createChatRoom,
  getAllMessages,
  getAllRooms,
} from "@/controllers/chatroom.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, getAllRooms);
router.get("/:id", authenticate, getAllMessages);
router.post("/", authenticate, createChatRoom);

export default router;
