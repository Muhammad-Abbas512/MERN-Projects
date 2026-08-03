import React from "react";
import { MessageCircle, User } from "lucide-react";

const UserCard = ({ user, type = "contact", onClick }) => {
  // Get initial for avatar
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
    >
      {/* Avatar */}
      {user?.profilePic ? (
        <img 
          src={user.profilePic} 
          alt={user?.username || "User"} 
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-emerald-50 font-semibold shrink-0">
          {getInitial(user?.username || user?.fullName || "U")}
        </div>
      )}

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-black truncate">
          {user?.username || user?.fullName || "Unknown User"}
        </p>
        <p className="text-xs text-gray-600 truncate">
          {user?.email || ""}
        </p>
      </div>

      {/* Action icon */}
      <div className="shrink-0">
        {type === "chat" ? (
          <MessageCircle className="w-4 h-4 text-gray-400" />
        ) : (
          <User className="w-5 h-5 text-gray-600" />
        )}
      </div>
    </div>
  );
};

export default UserCard;