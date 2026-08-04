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

  // Track users currently in a call: userId -> remoteUserId
  const usersInCall = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);

    const userId = socket.user._id.toString();
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // When a user comes online, update delivery status of their messages
    socket.on("markMessagesDelivered", ({ senderId }) => {
      // Emit to sender that messages have been delivered
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesDelivered", { receiverId: userId });
      }
    });

    // ============================
    // WebRTC Call Signaling Events
    // ============================

    // Caller initiates a call
    socket.on("call-user", ({ toUserId, offer, fromUserId, fromName }) => {
      const targetSocketId = getReceiverSocketId(toUserId);

      if (!targetSocketId) {
        // Callee is offline
        socket.emit("call-failed", { reason: "User is offline", toUserId });
        return;
      }

      // Check if callee is already in a call
      if (usersInCall.has(toUserId)) {
        socket.emit("call-failed", { reason: "User is busy", toUserId });
        return;
      }

      // Mark caller as in a call
      usersInCall.set(fromUserId, toUserId);

      io.to(targetSocketId).emit("incoming-call", {
        offer,
        fromUserId,
        fromName,
      });
    });

    // Callee accepts the call
    socket.on("answer-call", ({ toUserId, answer }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      const calleeId = userId;

      if (targetSocketId) {
        // Mark callee as in a call
        usersInCall.set(calleeId, toUserId);
        io.to(targetSocketId).emit("call-answered", { answer });
      }
    });

    // Callee rejects the call
    socket.on("reject-call", ({ toUserId }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      // Remove callee from in-call map (they were never fully in a call)
      usersInCall.delete(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-rejected", { fromUserId: userId });
      }
    });

    // Caller cancels the call (before it's answered)
    socket.on("cancel-call", ({ toUserId }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      usersInCall.delete(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-cancelled");
      }
    });

    // ICE candidate exchange (both directions)
    socket.on("ice-candidate", ({ toUserId, candidate }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice-candidate", { candidate });
      }
    });

    // Hang up (either side)
    socket.on("end-call", ({ toUserId }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      // Remove both users from in-call map
      usersInCall.delete(userId);
      usersInCall.delete(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended", { fromUserId: userId });
      }
    });

    // Notify callee that caller missed the call (timeout)
    socket.on("missed-call", ({ toUserId, fromUserId }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      usersInCall.delete(fromUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-missed", { fromUserId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
      delete userSocketMap[userId];

      // If user was in a call, notify the other party
      if (usersInCall.has(userId)) {
        const remoteUserId = usersInCall.get(userId);
        const remoteSocketId = getReceiverSocketId(remoteUserId);
        if (remoteSocketId) {
          io.to(remoteSocketId).emit("call-ended", { fromUserId: userId });
        }
        usersInCall.delete(userId);
        usersInCall.delete(remoteUserId);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}