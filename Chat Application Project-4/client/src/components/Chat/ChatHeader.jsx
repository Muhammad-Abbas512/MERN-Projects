import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ user, isOnline }) => {
  const navigate = useNavigate();

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f0f2f5] border-b border-gray-200">
      {/* Back button for mobile */}
      <button
        onClick={() => navigate("/")}
        className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer lg:hidden"
        aria-label="Back to chats"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Avatar */}
      {user?.profilePic ? (
        <img
          src={user.profilePic}
          alt={user?.fullName || user?.username || "User"}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold shrink-0">
          {getInitial(user?.fullName || user?.username)}
        </div>
      )}

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-gray-900 leading-tight truncate">
          {user?.fullName || user?.username || "Chat"}
        </p>
        <p className={`text-xs ${isOnline ? "text-green-600" : "text-gray-500"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Video call"
        >
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Phone call"
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;