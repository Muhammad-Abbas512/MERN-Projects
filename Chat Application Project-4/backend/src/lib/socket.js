import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";

// Map of userId -> socketId
const userSocketMap = {};

export let io;

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function initializeSocket(server) {
  // Allow all localhost / LAN / tunneled origins (matching app.js CORS config)
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/,
    /^https?:\/\/.*\.(ngrok\.io|localhost\.run|trycloudflare\.com|loca\.lt)$/,
  ];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
        if (isAllowed) {
          return callback(null, true);
        }
        console.warn(`Socket CORS blocked origin: ${origin}`);
        return callback(null, false);
      },
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");
      
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);

    const userId = socket.user._id.toString();
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}