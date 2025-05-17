"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiService } from "../services/api.service";

interface ChatRoom {
  id: number;
  username: string;
  lastmsg: string;
}

interface WebSocketContextType {
  rooms: ChatRoom[];
  isConnected: boolean;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("not authenticated");
      return;
    }
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      setReconnectAttempt(0);
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      // Attempt to reconnect with exponential backoff
      // const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
      // setTimeout(() => {
      //   setReconnectAttempt((prev) => prev + 1);
      //   setSocket(new WebSocket(wsUrl));
      // }, timeout);
    };

    ws.onerror = (error) => {
      setError("WebSocket error occurred");
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    fetchInitialChatroom().then((data) => setRooms(data));
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [reconnectAttempt]);

  const fetchInitialChatroom = async () => {
    try {
      const Rooms: ChatRoom[] = await ApiService.get("/chatroom");
      return Rooms;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const handleIncomingMessage = (data: any) => {
    switch (data.type) {
      case "chatroom_add":
        const nwChatroom: ChatRoom = data.payload;
        setRooms((prev) => {
          return [nwChatroom, ...prev];
        });
        break;
      case "ERROR":
        setError(data.message);
        break;
      default:
        console.warn("Unknown message type:", data.type);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        rooms,
        isConnected,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
