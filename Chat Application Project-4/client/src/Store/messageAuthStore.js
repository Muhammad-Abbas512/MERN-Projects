import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMessageAuthStore = create((set, get) => ({
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

  // ============================
  // Mark Chat As Read
  // ============================

  markChatAsRead: async (userId) => {
    try {
      await axiosInstance.post(`/messages/read/${userId}`);
      // Update local state to clear unread badge
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === userId ? { ...chat, unreadCount: 0 } : chat
        ),
      }));
    } catch (error) {
      // Silent fail - don't bother user with read status errors
      console.error("Failed to mark chat as read:", error);
    }
  },

  // ============================
  // Update Chat Optimistically (for real-time)
  // ============================

  updateChatInList: (chatId, updates) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat._id === chatId ? { ...chat, ...updates } : chat
      ),
    }));
  },

  // ============================
  // Clear Chat
  // ============================

  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      // Remove chat from list
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== userId),
      }));
      toast.success("Chat cleared successfully");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to clear chat"
      );
      return false;
    }
  },
}));