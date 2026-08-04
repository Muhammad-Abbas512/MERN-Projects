import React, { useRef, useState, useEffect } from 'react'
import { useAuthStore } from '../Store/useAuthStore'
import { axiosInstance } from '../lib/axios'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Phone, Video, Mail, User, Loader2 } from 'lucide-react'

const Profile = ({ isReadOnly = false }) => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore()
  const navigate = useNavigate()
  const { userId } = useParams()
  const fileInputRef = useRef(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [viewedUser, setViewedUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === authUser?._id
  const viewMode = isReadOnly || !isOwnProfile

  // Determine which user to display
  const displayUser = isOwnProfile ? authUser : viewedUser

  // Sync username when displayUser changes
  useEffect(() => {
    setUsername(displayUser?.username || '')
    setPreviewImage(displayUser?.profilePic || null)
  }, [displayUser])

  // Fetch other user's data when viewing their profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isOwnProfile || !userId) {
        setViewedUser(null)
        return
      }

      setIsLoadingUser(true)
      try {
        const res = await axiosInstance.get(`/auth/get-me?userId=${userId}`)
        setViewedUser(res.data.user)
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserProfile()
  }, [userId, isOwnProfile])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result)
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = () => {
    if (isOwnProfile && !viewMode) {
      fileInputRef.current?.click()
    }
  }

  const handleSave = async () => {
    const data = {}

    if (username && username !== authUser?.username) {
      data.username = username
    }

    if (selectedImage) {
      data.profilePic = selectedImage
    }

    if (Object.keys(data).length === 0) {
      return
    }

    const success = await updateProfile(data)
    if (success) {
      setSelectedImage(null)
      setPreviewImage(null)
      setIsMenuOpen(false)
    }
  }

  const getInitial = (name) => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#00a884] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {viewMode ? 'Contact Info' : 'My Profile'}
        </h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl w-full mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center border-b border-gray-200">
            {/* Avatar - clickable for own profile */}
            <div 
              className={`relative ${isOwnProfile && !viewMode ? 'cursor-pointer group' : ''}`}
              onClick={handleImageClick}
            >
              {isLoadingUser ? (
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#00a884]/30">
                  <Loader2 className="w-10 h-10 text-[#00a884] animate-spin" />
                </div>
              ) : previewImage || displayUser?.profilePic ? (
                <img
                  src={previewImage || displayUser?.profilePic}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#00a884]/30"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#00a884] flex items-center justify-center text-white text-4xl font-semibold border-4 border-[#00a884]/30">
                  {getInitial(displayUser?.username || displayUser?.fullName || '?')}
                </div>
              )}
              {/* Camera icon overlay for own profile */}
              {isOwnProfile && !viewMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {displayUser?.username || displayUser?.fullName || 'Loading...'}
            </h2>
            {!viewMode && (
              <p className="text-sm text-gray-500">Click on profile picture to change</p>
            )}
          </div>

          {/* User details */}
          <div className="px-6 py-4 space-y-3">
            {isLoadingUser ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-[#00a884] animate-spin" />
              </div>
            ) : (
              <>
                {displayUser?.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{displayUser.email}</span>
                  </div>
                )}
                {displayUser?.fullName && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{displayUser.fullName}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit/Send Message section */}
        {viewMode ? (
          /* Read-only: show Send Message button */
          <div className="bg-white rounded-xl shadow-sm p-4">
            <button
              onClick={() => navigate(`/chats/${userId || authUser?._id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00a884] text-white font-medium rounded-lg hover:bg-[#008f72] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </button>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <Video className="w-4 h-4" />
                Video
              </button>
            </div>
          </div>
        ) : (
          /* Editable: show edit form */
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Edit username */}
            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isUpdatingProfile}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowLeft className="w-5 h-5 rotate-180" />
              )}
              {isUpdatingProfile ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile