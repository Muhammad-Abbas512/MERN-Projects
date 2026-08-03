import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './Store/useAuthStore'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="bg-gray-800 h-screen flex items-center justify-center">
      <Routes>
        {/* Home is protected - only accessible when logged in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
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