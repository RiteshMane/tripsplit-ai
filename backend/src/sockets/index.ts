import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] client connected: ${socket.id}`);

    // Client joins a room per trip to receive scoped real-time updates
    socket.on("trip:join", (tripId: string) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("trip:leave", (tripId: string) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO not initialized yet");
  return io;
};

// Convenience emitters used across controllers
export const emitToTrip = (tripId: string, event: string, payload: unknown) => {
  if (!io) return;
  io.to(`trip:${tripId}`).emit(event, payload);
};
