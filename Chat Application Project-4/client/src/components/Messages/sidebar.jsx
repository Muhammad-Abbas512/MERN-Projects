import React, { useRef, useEffect, useState } from "react";
import { MoreVertical, LogOut, User, Users, Search, X, Loader2 } from "lucide-react";
import { useSidebarStore } from "../../Store/useSidebarStore";
import { useAuthStore } from "../../Store/useAuthStore";
import { useMessageAuthStore } from "../../Store/messageAuthStore";
import { useChatStore } from "../../Store/useChatStore";
import { useNavigate, useParams } from "react-router-dom";
import UserCard from "./UserCard";

const Sidebar = () => {
  const { setSelectedUser, getChatPartners } = useChatStore();
  const { authUser, logout: authLogout, onlineUsers } = useAuthStore();
  const { isDropdownOpen, toggleDropdown, closeDropdown } = useSidebarStore();
  const { chats, contacts, activeTab, isLoading, setActiveTab, fetchChats, fetchContacts } = useMessageAuthStore();
  const navigate = useNavigate();
  const { userId: activeChatId } = useParams();
  const dropdownRef = useRef(null);
  const contactsDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    getChatPartners();
  }, [getChatPartners]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
      if (contactsDropdownRef.current && !contactsDropdownRef.current.contains(event.target)) {
        setIsContactsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "chats") {
      fetchChats();
    } else {
      fetchContacts();
    }
  }, [activeTab, fetchChats, fetchContacts]);

  const handleLogout = async () => {
    closeDropdown();
    await authLogout();
    navigate("/login");
  };

  // Open contacts menu and fetch contacts
  const handleContactsToggle = () => {
    const newState = !isContactsOpen;
    setIsContactsOpen(newState);
    if (newState) {
      fetchContacts();
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsContactsOpen(false);
    navigate(`/chats/${user._id}`);
  };

  // Real-time search filtering
  const filteredChats = chats.filter((chat) =>
    (chat?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredContacts = contacts.filter((contact) =>
    (contact?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter tabs for chats
  const unreadChats = filteredChats.filter((chat) => (chat?.unreadCount || 0) > 0);
  const totalUnread = filteredChats.reduce((sum, chat) => sum + (chat?.unreadCount || 0), 0);

  // Apply filter tab
  const getFilteredChats = () => {
    switch (filterTab) {
      case "unread":
        return unreadChats;
      case "groups":
        return filteredChats.filter((chat) => chat?.isGroup);
      default:
        return filteredChats;
    }
  };

  const displayChats = getFilteredChats();

  return (
    <>
      {/* ============================
          Sidebar Panel - WhatsApp Style
      ============================ */}
      <div className="flex flex-col h-full bg-white w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5]">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>

          <div className="flex items-center gap-1">
            {/* Contacts icon near the 3-dots */}
            <div className="relative" ref={contactsDropdownRef}>
              <button
                onClick={handleContactsToggle}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isContactsOpen ? "bg-gray-200" : "hover:bg-gray-200"
                }`}
                aria-label="Contacts"
                title="Contacts"
              >
                <Users className="w-5 h-5 text-gray-700" />
              </button>

              {/* Contacts dropdown menu */}
              {isContactsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Contacts</p>
                    <button
                      onClick={() => setIsContactsOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Contacts search */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contacts..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Contacts list */}
                  <div className="max-h-80 overflow-y-auto py-1">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-[#00a884] animate-spin" />
                      </div>
                    ) : filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => {
                        const isOnline = onlineUsers?.includes(contact._id);
                        return (
                          <button
                            key={contact._id}
                            onClick={() => handleUserSelect(contact)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="relative shrink-0">
                              {contact?.profilePic ? (
                                <img
                                  src={contact.profilePic}
                                  alt={contact?.username || "User"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold">
                                  {(contact?.username || "U").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                  isOnline ? "bg-green-500" : "bg-gray-400"
                                }`}
                              ></span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact?.username || contact?.fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {contact?.email || ""}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                isOnline
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-sm text-gray-500">
                        {searchQuery ? "No contacts match your search" : "No contacts found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Three-dots button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {authUser?.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {authUser?.email || ""}
                    </p>
                  </div>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      closeDropdown();
                      navigate("/profile");
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <div className="border-t border-gray-200 my-1"></div>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 bg-[#f0f2f5]">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-sm">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter tabs for chats */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f5] overflow-x-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              filterTab === "all"
                ? "bg-[#00a884] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab("unread")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1 ${
              filterTab === "unread"
                ? "bg-[#00a884] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Unread
            {totalUnread > 0 && (
              <span className={`text-xs font-bold ${filterTab === "unread" ? "text-white" : "text-[#00a884]"}`}>
                {totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab("groups")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              filterTab === "groups"
                ? "bg-[#00a884] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Groups
          </button>
        </div>

        {/* Chat list area */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayChats.length > 0 ? (
            displayChats.map((chat) => (
              <UserCard
                key={chat._id}
                user={chat}
                type="chat"
                currentUserId={authUser?._id}
                isActive={activeChatId === chat._id}
                onClick={() => {
                  handleUserSelect(chat);
                  navigate(`/chats/${chat._id}`);
                }}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm px-4 text-center">
              {searchQuery ? "No chats match your search" : filterTab === "unread" ? "No unread chats" : "No chats yet. Start a conversation!"}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;