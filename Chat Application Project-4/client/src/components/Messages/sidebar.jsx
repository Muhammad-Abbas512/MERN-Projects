import React, { useRef, useEffect, useState } from "react";
import { MoreVertical, LogOut, User, Settings, MessageCircle, Users, Search } from "lucide-react";
import { useSidebarStore } from "../../Store/useSidebarStore";
import { useAuthStore } from "../../Store/useAuthStore";
import { useMessageAuthStore } from "../../Store/messageAuthStore";
import { useChatStore } from "../../Store/useChatStore";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { chatPartners, setSelectedUser, selectedUser, getChatPartners } = useChatStore();
  const { authUser, logout: authLogout } = useAuthStore();
  const { isDropdownOpen, toggleDropdown, closeDropdown } = useSidebarStore();
  const { chats, contacts, activeTab, isLoading, setActiveTab, fetchChats, fetchContacts } = useMessageAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getChatPartners();
  }, [getChatPartners]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Real-time search filtering
  const filteredChats = chats.filter((chat) =>
    (chat?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredContacts = contacts.filter((contact) =>
    (contact?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* ============================
          Sidebar Panel
      ============================ */}
      <div className="flex flex-col h-full bg-white rounded-xl p-5 absolute left-0 overflow-hidden">
          {/* Header with three-dots button */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-3xl font-bold text-[#210f40]">Chats</h2>

            {/* Three-dots button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="p-2 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-10">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white truncate">
                      {authUser?.username || "User"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {authUser?.email || ""}
                    </p>
                  </div>

                  <button
                    className="w-full flex cursor-pointer items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={closeDropdown}
                  >
                    <User className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </button>

                  <div className="border-t border-gray-700 my-1"></div>

                  <button
                    className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chats / Contacts toggle buttons */}
          <div className="flex gap-2 p-3 pt-5">
            <button
              onClick={() => handleTabChange("chats")}
              className={`flex-1 flex items-center cursor-pointer justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "chats"
                  ? "bg-gray-400 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chats
            </button>
            <button
              onClick={() => handleTabChange("contacts")}
              className={`flex-1 flex items-center cursor-pointer justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "contacts"
                  ? "bg-gray-400 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Contacts
            </button>
          </div>

          {/* Search bar */}
          <div className="p-2 pt-3">
            <div className="flex items-center gap-4 bg-gray-300 px-6 py-3 rounded-full">
              <Search className="w-9 h-9 text-gray-800" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="flex-1 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Chat/Contact list area */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : activeTab === "chats" ? (
              filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <UserCard 
                  key={chat._id} 
                  user={chat} 
                  type="chat"
                  onClick={() => {
                    handleUserSelect(chat);
                    navigate(`/chats/${chat._id}`);
                  }}
                />
              ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-800 text-sm">
                  {searchQuery ? "No chats match your search" : "No chats yet"}
                </div>
              )
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <UserCard 
                  key={contact._id} 
                  user={contact} 
                  type="contact"
                  onClick={() => {
                    handleUserSelect(contact);
                    navigate(`/chats/${contact._id}`);
                  }}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-800 text-lg">
                {searchQuery ? "No contacts match your search" : "No contacts found"}
              </div>
            )}
          </div>
      </div>
    </>
  );
};

export default Sidebar;