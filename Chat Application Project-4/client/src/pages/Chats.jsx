import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../Store/useChatStore.js";
import { useAuthStore } from "../Store/useAuthStore.js";
import Sidebar from "../components/Messages/sidebar.jsx";
import ChatHeader from "../components/Chat/ChatHeader.jsx";
import ChatArea from "../components/Chat/ChatArea.jsx";
import ChatInput from "../components/Chat/ChatInput.jsx";
import Profile from "./Profile";

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
  const [showProfile, setShowProfile] = useState(false);

  if (!userId) {
    return (
      <div className="bg-[#f0f2f5] h-screen flex w-full">
        {/* Sidebar - full width on mobile, fixed width on desktop */}
        <div className="w-full lg:w-96 flex shrink-0 h-full border-r border-gray-200">
          <Sidebar />
        </div>
        {/* Empty state - hidden on mobile */}
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#00a884]/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#00a884]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">Select a chat to start messaging</p>
            <p className="text-sm text-gray-500 mt-1">Choose a conversation from the sidebar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] h-screen flex w-full overflow-hidden">
      {/* Sidebar - hidden on mobile when a chat is open */}
      <div className="hidden lg:flex w-96 flex shrink-0 h-full border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Chat panel - full width on mobile */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#efeae2]">
        {/* Header with user info - fixed at top */}
        <div className="shrink-0 bg-[#f0f2f5]">
          <ChatHeader
            user={selectedUser}
            isOnline={isOnline}
            showProfile={showProfile}
            onBack={() => setShowProfile(false)}
            onProfileClick={() => setShowProfile(true)}
          />
        </div>

        {/* Messages - scrollable with background */}
        {showProfile ? (
          <div className="flex-1 overflow-y-auto bg-[#efeae2]">
            <Profile userId={selectedUser?._id} isReadOnly={true} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#efeae2]">
            <ChatArea
              messages={messages}
              authUser={authUser}
              isLoading={isMessagesLoading}
            />
          </div>
        )}

        {/* Input - fixed at bottom */}
        {!showProfile && (
          <div className="shrink-0 bg-[#f0f2f5]">
            <ChatInput />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
