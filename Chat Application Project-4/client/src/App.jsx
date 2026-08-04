import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './Store/useAuthStore'
import { useCallStore } from './Store/useCallStore'
import MessageHome from './pages/MessageHome'
import Profile from './pages/Profile'
import ChatPage from './pages/Chats'
import CallScreen from './components/Chat/CallScreen'

function App() {
  const { checkAuth, socket, authUser } = useAuthStore()
  const { initCallListeners, cleanup } = useCallStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Initialize call listeners once the socket is available
  useEffect(() => {
    if (socket) {
      initCallListeners()
    }
  }, [socket, initCallListeners])

  // Clean up call resources when user logs out
  useEffect(() => {
    if (!authUser) {
      cleanup()
    }
  }, [authUser, cleanup])

  return (
    <div className="h-screen w-full overflow-hidden">
      <Routes>
        {/* Home is protected - only accessible when logged in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MessageHome />
            </ProtectedRoute>
          }
        />

        {/* Profile - protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Chat page - protected */}
        <Route
          path="/chats/:userId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* User Profile - protected (supports both own and other users) */}
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <Profile isReadOnly />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>

      {/* Call Screen - renders globally on top of all routes */}
      <CallScreen />
    </div>
  )
}

export default App
