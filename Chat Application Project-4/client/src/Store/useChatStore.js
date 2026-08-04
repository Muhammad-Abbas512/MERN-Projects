import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { useMessageAuthStore } from "./messageAuthStore.js";
import { playSendSound, playReceiveSound } from "../lib/sound.js";
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

      // Mark chat as read when opening
      const { markChatAsRead, fetchChats } = useMessageAuthStore.getState();
      markChatAsRead(userId);
      // Refresh chats to update unread badges in real-time
      fetchChats();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, getChatPartners } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      // Append new message locally
      set({ messages: [...messages, res.data.newMessage] });
      // Play send sound
      playSendSound();
      // Refresh sidebar to show updated last message
      getChatPartners();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Delete chat for current user only
  clearChatForMe: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear-for-me/${userId}`);
      set({ messages: [] });
      const { fetchChats } = useMessageAuthStore.getState();
      fetchChats();
      toast.success("Chat deleted for you");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete chat");
      return false;
    }
  },

  // Delete chat for both users
  clearChatForBoth: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear-for-both/${userId}`);
      set({ messages: [] });
      const { fetchChats } = useMessageAuthStore.getState();
      fetchChats();
      toast.success("Chat deleted for everyone");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete chat");
      return false;
    }
  },

  // Clear chat with selected user (both - default behavior)
  clearChat: async (userId) => {
    return get().clearChatForBoth(userId);
  },

  // Subscribe to real-time messages for the selected user
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove old listener to avoid duplicates
    socket.off("newMessage");
    socket.off("chatCleared");
    socket.off("messageStatusUpdated");

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, chatPartners, getChatPartners } = get();
      const authUser = useAuthStore.getState().authUser;

      const senderId = newMessage.senderId?._id?.toString() || newMessage.senderId?.toString();
      const receiverId = newMessage.receiverId?._id?.toString() || newMessage.receiverId?.toString();
      const authUserId = authUser?._id?.toString();

      // Determine the other party in this conversation
      const otherUserId = senderId === authUserId ? receiverId : senderId;

      // Play sound and show notification for received message
      if (senderId !== authUserId) {
        playReceiveSound();
        // Show notification
        const senderName = newMessage.senderId?.username || newMessage.senderId?.fullName || "Someone";
        toast.success(`New message from ${senderName}`, {
          icon: '💬',
          duration: 3000,
        });
      }

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

      // Always refresh sidebar to show updated last message and unread counts
      getChatPartners();
    });

    // Listen for message status updates (delivered/seen)
    socket.on("messageStatusUpdated", ({ messageId, status, partnerId }) => {
      const { messages, selectedUser } = get();
      const { updateChatInList, fetchChats } = useMessageAuthStore.getState();
      
      // Update message status locally
      const updatedMessages = messages.map((msg) =>
        msg._id === messageId ? { ...msg, status } : msg
      );
      
      set({ messages: updatedMessages });

      // If status is "seen", reset unread count for this partner
      if (status === "seen" && partnerId) {
        updateChatInList(partnerId, { unreadCount: 0 });
      }

      // Refresh sidebar to update unread counts
      fetchChats();
    });

    // Listen for chat cleared events (real-time)
    socket.on("chatCleared", ({ userId, type }) => {
      const { selectedUser } = get();
      const authUser = useAuthStore.getState().authUser;

      // If this is the currently selected chat, clear messages
      if (selectedUser && selectedUser._id?.toString() === userId) {
        if (type === "forBoth") {
          set({ messages: [] });
          toast("Chat was cleared by the other user", { icon: "🗑️" });
        }
      }

      // Refresh sidebar in real-time
      const { fetchChats } = useMessageAuthStore.getState();
      fetchChats();
      get().getChatPartners();
    });
  },

  // Unsubscribe from real-time messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("chatCleared");
      socket.off("messageStatusUpdated");
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));