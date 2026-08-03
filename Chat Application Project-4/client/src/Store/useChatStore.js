import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { useMessageAuthStore } from "./messageAuthStore.js";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  messages: [],
  chatPartners: [],
  selectedUser: null,
  isMessagesLoading: false,
  isChatPartnersLoading: false,

  // Sidebar: list of people you've chatted with
  getChatPartners: async () => {
    set({ isChatPartnersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chatPartners: res.data.chatPartners });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isChatPartnersLoading: false });
    }
  },

  // Open a specific chat: fetch messages with that user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages || [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      // Append new message locally
      set({ messages: [...messages, res.data.newMessage] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Subscribe to real-time messages for the selected user
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove old listener to avoid duplicates
    socket.off("newMessage");

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, chatPartners } = get();
      const authUser = useAuthStore.getState().authUser;

      const senderId = newMessage.senderId?._id?.toString() || newMessage.senderId?.toString();
      const receiverId = newMessage.receiverId?._id?.toString() || newMessage.receiverId?.toString();
      const authUserId = authUser?._id?.toString();

      // Determine the other party in this conversation
      const otherUserId = senderId === authUserId ? receiverId : senderId;

      // If we have a selected user and this message is from/to them, add to messages
      if (selectedUser) {
        const currentUserId = selectedUser._id?.toString();
        if (senderId === currentUserId || receiverId === currentUserId) {
          // Avoid duplicate messages
          const isDuplicate = messages.some((m) => m._id === newMessage._id);
          if (!isDuplicate) {
            set({ messages: [...messages, newMessage] });
          }
        }
      }

      // Update chat partners list if this is a new conversation partner
      if (otherUserId && otherUserId !== authUserId) {
        const partnerExists = chatPartners.some((p) => p._id?.toString() === otherUserId);
        if (!partnerExists) {
          // Fetch updated chat partners
          get().getChatPartners();
        }
      }

      // Always refresh sidebar chats to show latest message ordering
      const { fetchChats } = useMessageAuthStore.getState();
      fetchChats();
    });
  },

  // Unsubscribe from real-time messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));