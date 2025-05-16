// src/services/ws.service.ts
import WebSocket from "ws";
import prisma from "@/utils/prisma";
// import { log as logger } from 'console';
import logger from "console";

interface ActiveConnection {
  ws: WebSocket;
  userId: number;
  lastActive: Date;
}

class WSService {
  private static instance: WSService;
  private activeConnections: Map<number, ActiveConnection>; // userId, activeConnection
  private roomSubscriptions: Map<number, Set<number>>; // roomId -> Set<userId>

  private constructor() {
    this.activeConnections = new Map();
    this.roomSubscriptions = new Map();
  }

  public static getInstance(): WSService {
    if (!WSService.instance) {
      WSService.instance = new WSService();
    }
    return WSService.instance;
  }

  // Add new connection with user context
  public async addConnection(userId: number, ws: WebSocket): Promise<void> {
    // Clean up any existing connection for this user
    this.removeConnection(userId);

    // Add new connection
    this.activeConnections.set(userId, {
      ws,
      userId,
      lastActive: new Date(),
    });

    // Subscribe to all rooms the user participates in
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { id: true },
    });
    rooms.forEach((room) => {
      this.subscribeToRoom(userId, room.id);
    });

    this.setupConnectionListeners(userId, ws);
    logger.info(
      `User ${userId} connected. Active connections: ${this.activeConnections.size}`
    );
  }

  // Remove connection and clean up subscriptions
  public removeConnection(userId: number): void {
    if (this.activeConnections.has(userId)) {
      const connection = this.activeConnections.get(userId);
      connection?.ws.terminate(); // Close the WebSocket
      this.activeConnections.delete(userId);

      // Remove from all room subscriptions
      this.roomSubscriptions.forEach((userSet, roomId) => {
        userSet.delete(userId);
        if (userSet.size === 0) {
          this.roomSubscriptions.delete(roomId);
        }
      });

      logger.info(
        `User ${userId} disconnected. Active connections: ${this.activeConnections.size}`
      );
    }
  }

  // Subscribe user to a specific room
  public subscribeToRoom(userId: number, roomId: number): void {
    if (!this.roomSubscriptions.has(roomId)) {
      this.roomSubscriptions.set(roomId, new Set());
    }
    this.roomSubscriptions.get(roomId)?.add(userId);
  }

  // Unsubscribe user from a room
  public unsubscribeFromRoom(userId: number, roomId: number): void {
    this.roomSubscriptions.get(roomId)?.delete(userId);
  }

  // Broadcast message to all users in a room (optionally excluding sender)
  public broadcastToRoom(
    roomId: number,
    message: string,
    excludeUserIds: number[] = []
  ): void {
    const recipients = this.roomSubscriptions.get(roomId) || new Set();

    recipients.forEach((userId) => {
      if (!excludeUserIds.includes(userId)) {
        this.sendToUser(userId, message);
      }
    });
  }

  // Send message to specific user
  public sendToUser(userId: number, message: string): boolean {
    const connection = this.activeConnections.get(userId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(message);
        connection.lastActive = new Date();
        return true;
      } catch (error) {
        logger.error(`Error sending to user ${userId}:`, error);
        this.removeConnection(userId);
        return false;
      }
    }
    return false;
  }

  // Get all active users in a room
  public getActiveUsersInRoom(roomId: number): number[] {
    const users = this.roomSubscriptions.get(roomId) || new Set();
    return Array.from(users).filter((userId) =>
      this.activeConnections.has(userId)
    );
  }

  // Setup connection listeners
  private setupConnectionListeners(userId: number, ws: WebSocket): void {
    ws.on("pong", () => {
      const connection = this.activeConnections.get(userId);
      if (connection) {
        connection.lastActive = new Date();
      }
    });

    ws.on("close", () => {
      this.removeConnection(userId);
    });

    // Heartbeat check
    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        this.removeConnection(userId);
        return;
      }
      ws.ping();
    }, 30000); // 30 seconds

    ws.on("error", (error) => {
      logger.error(`WS error for user ${userId}:`, error);
      this.removeConnection(userId);
    });
  }
}

export default WSService.getInstance();
