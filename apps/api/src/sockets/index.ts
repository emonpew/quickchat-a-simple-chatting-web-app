import WebSocket from "ws";
import { handleChatMessage, handleTypingIndicator } from "./events/chat.event";

type WSEvent = {
  type: "message" | "typing" | "user_online" | "ping";
  payload: any;
};

export const wsRouter = (ws: WebSocket, message: string, senderId: number) => {
  const event: WSEvent = JSON.parse(message);

  switch (event.type) {
    case "message":
      handleChatMessage(ws, event.payload, senderId);
      break;
    case "typing":
      handleTypingIndicator(ws, event.payload, senderId);
      break;
    case "ping":
      ws.send(JSON.stringify({ type: "pong" }));
      console.log("pong");
      break;
    default:
      console.warn(`Unknown event type: ${event.type}`);
  }
};
