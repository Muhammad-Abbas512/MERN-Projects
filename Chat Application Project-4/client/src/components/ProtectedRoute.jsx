import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../Store/useAuthStore'

const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore()

  // Show loading while checking auth (e.g. on page refresh)
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-800">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
