import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { WebSocket } from "ws";
import http from "http";
import { wsRouter } from "./sockets";
import authRoute from "@/routes/auth.routes";
import chatRoute from "@/routes/chatroom.route";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./utils/config";
import wsService from "./services/ws.service";
import { getUsers } from "./controllers/user.controller";
import { authenticate as authenticateMiddleware } from "./middlewares/auth.middleware";

function authenticate(token: string) {
  try {
    // const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch (error) {
    console.log("invalid token");
    return;
  }
}

export const createServer = () => {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/message/:name", (req, res) => {
      return res.json({ message: `hello ${req.params.name}` });
    })
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    });

  app.use("/auth", authRoute);
  app.use("/chatroom", chatRoute);
  app.get("/user", authenticateMiddleware, (req, res) => {
    getUsers(req, res);
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    if (!token) {
      ws.close(1008, "Authentication token required");
      return;
    }
    const userId = authenticate(token);
    if (!userId) {
      ws.close();
      return;
    }
    wsService.addConnection(userId, ws);
    ws.on("message", (message) => {
      wsRouter(ws, message.toString(), userId);
    });
  });

  return server;
};
