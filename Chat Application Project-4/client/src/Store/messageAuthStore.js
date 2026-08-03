import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMessageAuthStore = create((set) => ({
  // ============================
  // State
  // ============================

  chats: [],
  contacts: [],
  activeTab: "chats",
  isLoading: false,

  // ============================
  // Set Active Tab
  // ============================

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
    }),

  // ============================
  // Fetch Chats
  // ============================

  fetchChats: async () => {
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get("/messages/chats");

      set({
        chats: res.data.chatPartners || [],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load chats"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================
  // Fetch Contacts
  // ============================

  fetchContacts: async () => {
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get("/messages/contacts");

      set({
        contacts: res.data.filteredUsers || [],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load contacts"
      );
    } finally {
      set({ isLoading: false });
    }
  },
}));