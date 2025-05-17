// Example type definitions (src/types/socket.d.ts)
export interface ChatMessagePayload {
  roomId: number;
  content: string;
}

export interface TypingIndicatorPayload {
  roomId: number;
  isTyping: boolean;
}

export interface chatroomAddPayload {
  recieverId: number;
}
