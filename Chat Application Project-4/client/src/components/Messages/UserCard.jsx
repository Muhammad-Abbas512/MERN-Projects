import React, { memo } from "react";
import { User, CheckCheck } from "lucide-react";
import { useAuthStore } from "../../Store/useAuthStore";

const UserCard = memo(({ user, type = "contact", onClick, isActive = false, currentUserId }) => {
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers?.includes(user?._id);

  // Get initial for avatar
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Format timestamp like WhatsApp: time if today, "Yesterday" if yesterday, else date
  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (msgDate.getTime() === today.getTime()) {
      // Today - show time
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (msgDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Older - show date
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Determine if last message was sent by current user
  const isOwnLastMessage = user?.lastMessageSenderId && currentUserId &&
    user.lastMessageSenderId.toString() === currentUserId.toString();

  const unreadCount = user?.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 mb-2 rounded-xl transition-colors cursor-pointer border ${
        isActive
          ? "bg-[#f0f2f5] border-[#00a884]/30"
          : "hover:bg-gray-50 border-transparent"
      }`}
    >
      {/* Avatar with online status ring */}
      <div className="relative shrink-0">
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt={user?.username || "User"}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold">
            {getInitial(user?.username || user?.fullName || "U")}
          </div>
        )}
        {/* Online/Offline indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        ></span>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] truncate ${hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>
          {user?.username || user?.fullName || "Unknown User"}
        </p>
        
        {/* Show only online/offline status for chat type */}
        {type === "chat" && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
            <span className={`text-xs ${isOnline ? "text-green-600" : "text-gray-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        )}
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-[#25d366] text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Action icon for contacts */}
      {type === "contact" && (
        <div className="shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
});

UserCard.displayName = "UserCard";

export default UserCard;