import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

// Allow requests from:
// - localhost (any port)
// - 127.0.0.1 (any port)
// - LAN devices (192.168.x.x, 10.x.x.x, 172.16.x.x - 172.31.x.x)
// - Any forwarded port (e.g. ngrok, localhost.run, npm tunnel, etc.)
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/,
  /^https?:\/\/.*\.(ngrok\.io|localhost\.run|trycloudflare\.com|loca\.lt)$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, socket.io)
      if (!origin) return callback(null, true);

      // Allow any localhost / LAN / tunneled origin
      const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
      if (isAllowed) {
        return callback(null, true);
      }

      // Log rejected origins for debugging
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16mb" }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);

export default app;