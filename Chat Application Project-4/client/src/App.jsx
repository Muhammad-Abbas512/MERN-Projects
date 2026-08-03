import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './Store/useAuthStore'
import MessageHome from './pages/MessageHome' 
import Profile from './pages/Profile'
import ChatPage from './pages/Chats'
 
function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="bg-gray-950 h-screen flex items-center justify-center">
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

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </div>
  )
}

export default App