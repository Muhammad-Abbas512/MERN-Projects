import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

const ChatArea = ({ messages, authUser, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      style={{
        backgroundImage: "url('/chat-bg.svg')",
        backgroundColor: "#efeae2",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : messages.length > 0 ? (
        messages.map((msg) => {
          const senderIdStr = msg.senderId?._id?.toString() || msg.senderId?.toString();
          const authUserIdStr = authUser?._id?.toString();
          const isOwnMessage = senderIdStr === authUserIdStr;

          return (
            <ChatBubble
              key={msg._id}
              sender={isOwnMessage ? "me" : "other"}
              message={msg.text}
              time={formatTime(msg.createdAt)}
              seen={true}
              image={msg.image}
            />
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">
            No messages yet. Start a conversation!
          </p>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatArea;