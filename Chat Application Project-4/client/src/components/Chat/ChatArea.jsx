import { useEffect, useRef, useMemo } from "react";
import ChatBubble from "./ChatBubble";
import MissedCallMessage from "./MissedCallMessage";

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

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel;
      if (msgDate.toDateString() === today.toDateString()) {
        dateLabel = "Today";
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = msgDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: msgDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });
      }

      if (dateLabel !== currentDate) {
        groups.push({ type: "date", label: dateLabel, date: msgDate });
        currentDate = dateLabel;
      }

      groups.push({ type: "message", data: msg });
    });

    return groups;
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6"
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
        <div className="max-w-4xl mx-auto space-y-1">
          {groupedMessages.map((item, idx) => {
            if (item.type === "date") {
              return (
                <div key={`date-${idx}`} className="flex justify-center my-4">
                  <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {item.label}
                  </span>
                </div>
              );
            }

            const msg = item.data;
            const senderIdStr = msg.senderId?._id?.toString() || msg.senderId?.toString();
            const authUserIdStr = authUser?._id?.toString();
            const isOwnMessage = senderIdStr === authUserIdStr;

            // Render missed call messages with a special component
            if (msg.type === "missed_call") {
              return (
                <MissedCallMessage
                  key={msg._id}
                  isOwn={isOwnMessage}
                  time={formatTime(msg.createdAt)}
                />
              );
            }

            return (
              <ChatBubble
                key={msg._id}
                sender={isOwnMessage ? "me" : "other"}
                message={msg.text}
                time={formatTime(msg.createdAt)}
                seen={msg.status === "seen"}
                status={msg.status}
                image={msg.image}
              />
            );
          })}
        </div>
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