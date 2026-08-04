import React, { useState } from "react";
import { X, Trash2, UserX, Loader2 } from "lucide-react";
import { useChatStore } from "../../Store/useChatStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ClearChatModal = ({ isOpen, onClose, user }) => {
  const { clearChatForMe, clearChatForBoth } = useChatStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState(null);

  if (!isOpen || !user) return null;

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const handleDeleteForMe = async () => {
    setDeleteType("forMe");
    setIsDeleting(true);
    const success = await clearChatForMe(user._id);
    setIsDeleting(false);
    setDeleteType(null);
    if (success) {
      onClose();
      navigate("/");
    }
  };

  const handleDeleteForBoth = async () => {
    setDeleteType("forBoth");
    setIsDeleting(true);
    const success = await clearChatForBoth(user._id);
    setIsDeleting(false);
    setDeleteType(null);
    if (success) {
      onClose();
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#00a884] text-white">
          <h3 className="text-lg font-semibold">Delete Chat</h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
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
            <div>
              <p className="font-semibold text-gray-900 truncate">
                {user?.username || user?.fullName || "User"}
              </p>
              <p className="text-sm text-gray-500">
                Do you want to delete this conversation?
              </p>
            </div>
          </div>

          {/* Warning text */}
          <p className="text-sm text-gray-600 mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3">
            This action cannot be undone. Messages will be permanently deleted.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDeleteForBoth}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting && deleteType === "forBoth" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              {isDeleting && deleteType === "forBoth" ? "Deleting..." : "Delete for Both"}
            </button>

            <button
              onClick={handleDeleteForMe}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting && deleteType === "forMe" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserX className="w-5 h-5" />
              )}
              {isDeleting && deleteType === "forMe" ? "Deleting..." : "Delete for Me Only"}
            </button>

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearChatModal;