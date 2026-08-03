import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  // ============================
  // State
  // ============================

  authUser: null,

  isCheckingAuth: false,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingEmail: false,
  isUpdatingProfile: false,

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

      localStorage.removeItem("accessToken");

      set({
        authUser: null,
      });

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Logout failed"
      );
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

  updateProfile: async (profilePic) => {
    set({
      isUpdatingProfile: true,
    });

    try {
      const res = await axiosInstance.put(
        "/auth/update-profile",
        {
          profilePic,
        }
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