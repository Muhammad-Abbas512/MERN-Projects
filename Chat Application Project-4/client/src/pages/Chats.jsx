import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../Store/useChatStore.js";
import { useAuthStore } from "../Store/useAuthStore.js";
import Sidebar from "../components/Messages/sidebar.jsx";
import ChatHeader from "../components/Chat/ChatHeader.jsx";
import ChatArea from "../components/Chat/ChatArea.jsx";
import ChatInput from "../components/Chat/ChatInput.jsx";

const ChatPage = () => {
  const { userId } = useParams();
  const {
    selectedUser,
    messages,
    chatPartners,
    getMessages,
    getChatPartners,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  useEffect(() => {
    if (chatPartners.length === 0) getChatPartners();
  }, []);

  useEffect(() => {
    if (!userId) return;

    if (!selectedUser || selectedUser._id !== userId) {
      const foundUser = chatPartners.find((u) => u._id === userId);
      if (foundUser) setSelectedUser(foundUser);
    }

    getMessages(userId);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [userId, chatPartners]);

  const isOnline = onlineUsers?.includes(selectedUser?._id);

  if (!userId) {
    return (
      <div className="bg-[#f0f2f5] h-screen flex w-full">
        <div className="w-99 flex shrink-0 h-full border-r border-gray-200">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] h-screen flex w-full">
      <div className="w-90 flex shrink-0 h-full border-r border-gray-200">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 p-3">
        {/* Header with user info */}
        <ChatHeader user={selectedUser} isOnline={isOnline} />

        {/* Messages */}
        <ChatArea
          messages={messages}
          authUser={authUser}
          isLoading={isMessagesLoading}
        />

        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;