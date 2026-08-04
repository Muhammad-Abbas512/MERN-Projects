import { useState, useRef, useEffect } from "react";
import { MoreVertical, Phone, Video, ArrowLeft, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClearChatModal from "./ClearChatModal";
import { useCallStore } from "../../Store/useCallStore.js";

const ChatHeader = ({ user, isOnline, showProfile, onBack, onProfileClick }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const menuRef = useRef(null);
  const { initiateCall, callState } = useCallStore();

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate(`/user/${user?._id}`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f0f2f5] border-b border-gray-200">
      {/* Back button for mobile - context aware */}
        <button
          onClick={() => {
            if (showProfile && onBack) {
              onBack();
            } else {
              navigate("/");
            }
          }}
          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Avatar - click to view profile */}
        <button
          onClick={handleProfileClick}
          className="relative shrink-0 cursor-pointer group"
          aria-label="View profile"
        >
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user?.fullName || user?.username || "User"}
              className="w-10 h-10 rounded-full object-cover shrink-0 group-hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold shrink-0 group-hover:opacity-90 transition-opacity">
              {getInitial(user?.fullName || user?.username)}
            </div>
          )}
          {/* Online indicator */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#f0f2f5] ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
        </button>

        {/* User info - click to view profile */}
        <button
          onClick={handleProfileClick}
          className="flex-1 min-w-0 text-left cursor-pointer"
          aria-label="View profile"
        >
          <p className="text-[15px] font-semibold text-gray-900 leading-tight truncate">
            {user?.fullName || user?.username || "Chat"}
          </p>
          <p className="text-xs flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
            <span className={isOnline ? "text-green-600" : "text-gray-500"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </p>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Video call"
            title="Video call (coming soon)"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (callState !== "idle" || !isOnline) return;
              if (!user?._id) return;
              initiateCall(user);
            }}
            disabled={callState !== "idle" || !isOnline}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Voice call"
            title={isOnline ? "Voice call" : "User is offline"}
          >
            <Phone className={`w-5 h-5 ${!isOnline ? "text-gray-400" : "text-gray-600"}`} />
          </button>

          {/* Three-dots menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsClearModalOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      <ClearChatModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default ChatHeader;