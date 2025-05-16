// Example type definitions (src/types/socket.d.ts)
export interface ChatMessagePayload {
  token: string;
  roomId: number;
  content: string;
}

export interface TypingIndicatorPayload {
  token: string;
  roomId: number;
  isTyping: boolean;
}
