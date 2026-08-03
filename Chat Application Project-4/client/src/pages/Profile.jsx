import React, { useRef, useState, useEffect } from 'react'
import { useAuthStore } from '../Store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, Eye, Camera, Save, ArrowLeft, User } from 'lucide-react'

const Profile = () => {
  const { authUser, logout, updateProfile, isUpdatingProfile } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const menuRef = useRef(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [username, setUsername] = useState(authUser?.username || '')
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  // Sync username when authUser changes
  useEffect(() => {
    setUsername(authUser?.username || '')
  }, [authUser])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result)
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
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

  const getInitial = () => {
    return (authUser?.username || '?').charAt(0).toUpperCase()
  }

  return (
    <div className="bg-gray-800 h-screen w-full flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-3xl font-bold text-blue-950 mb-8">
          Profile
        </h1>

        {authUser && (
          <div className="mb-8">
            {/* Center rounded profile with click menu */}
            <div className="relative inline-block" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg cursor-pointer group"
                aria-label="Profile options"
              >
                {previewImage || authUser?.profilePic ? (
                  <img
                    src={previewImage || authUser?.profilePic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                    {getInitial()}
                  </div>
                )}
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      // View profile - just close menu, profile is already shown
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      fileInputRef.current?.click()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Change Profile
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Username */}
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              {authUser.username}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{authUser.email}</p>
          </div>
        )}

        {/* Edit username */}
        <div className="mb-6 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
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
            <Save size={20} />
          )}
          {isUpdatingProfile ? 'Saving...' : 'Save'}
        </button>

        
      </div>
    </div>
  )
}

export default Profile