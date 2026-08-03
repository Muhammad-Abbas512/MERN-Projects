import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { initializeSocket } from "./src/lib/socket.js";

connectDB();

const server = http.createServer(app);

// Initialize Socket.IO with the real app server
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});