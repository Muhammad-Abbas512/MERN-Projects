import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// Dynamic socket URL — uses the same host/port the app is accessed from.
// This works for localhost, forwarded ports, and other devices on the network.
// Falls back to localhost:3000 if window is unavailable (e.g. during build).
const getSocketURL = () => {
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    // Vite dev server proxies /socket.io to backend at port 3000
    return `${protocol}//${hostname}:${port}`;
  }
  return "http://localhost:3000";
};

const SOCKET_URL = getSocketURL();

export const useAuthStore = create((set, get) => ({
  // ============================
  // State
  // ============================

  authUser: null,
  socket: null,
  onlineUsers: [],

  isCheckingAuth: false,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingEmail: false,
  isUpdatingProfile: false,

  // ============================
  // Socket Connection
  // ============================

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },

  // ============================
  // Check Authentication
  // ============================

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");

      set({
        authUser: res.data.user,
      });
      
      // Connect socket after auth check
      const { connectSocket } = get();
      connectSocket();
    } catch (error) {
      set({
        authUser: null,
      });
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  // ============================
  // Signup
  // ============================

  signup: async (formData) => {
    set({
      isSigningUp: true,
    });

    try {
      const res = await axiosInstance.post(
        "/auth/register",
        formData
      );

      toast.success(res.data.message);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Signup failed"
      );

      return false;
    } finally {
      set({
        isSigningUp: false,
      });
    }
  },

  // ============================
  // Verify Email
  // ============================

  verifyEmail: async ({ otp, email }) => {
    set({
      isVerifyingEmail: true,
    });

    try {
      const res = await axiosInstance.post(
        "/auth/verify-email",
        {
          otp,
          email,
        }
      );

      toast.success(res.data.message);

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Verification failed"
      );

      return false;
    } finally {
      set({
        isVerifyingEmail: false,
      });
    }
  },

  // ============================
  // Login
  // ============================

  login: async (formData) => {
    set({
      isLoggingIn: true,
    });

    try {
      const res = await axiosInstance.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "accessToken",
        res.data.accessToken
      );

      set({
        authUser: res.data.user,
      });

      toast.success(res.data.message);

      // Connect socket after login
      const { connectSocket } = get();
      connectSocket();

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed"
      );

      return false;
    } finally {
      set({
        isLoggingIn: false,
      });
    }
  },

  // ============================
  // Logout
  // ============================

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Logout failed"
      );
    } finally {
      localStorage.removeItem("accessToken");
      
      // Disconnect socket
      const { disconnectSocket } = get();
      disconnectSocket();

      set({
        authUser: null,
      });
    }
  },

  // ============================
  // Refresh Token
  // ============================

  refreshToken: async () => {
    try {
      const res = await axiosInstance.get(
        "/auth/refresh-token"
      );

      localStorage.setItem(
        "accessToken",
        res.data.accessToken
      );

      return true;
    } catch (error) {
      return false;
    }
  },

  // ============================
  // Get Current User
  // ============================

  getMe: async () => {
    try {
      const res = await axiosInstance.get(
        "/auth/get-me"
      );

      set({
        authUser: res.data.user,
      });
    } catch (error) {
      console.log(error);
    }
  },

  // ============================
  // Update Profile
  // ============================

  updateProfile: async (data) => {
    set({
      isUpdatingProfile: true,
    });

    try {
      const res = await axiosInstance.put(
        "/auth/update-profile",
        data
      );

      set({
        authUser:
          res.data.user ||
          res.data.updatedUser,
      });

      toast.success(
        "Profile updated successfully"
      );

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Profile update failed"
      );

      return false;
    } finally {
      set({
        isUpdatingProfile: false,
      });
    }
  },
}));