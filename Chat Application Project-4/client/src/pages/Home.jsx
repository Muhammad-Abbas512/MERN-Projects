import React from 'react'
import { useAuthStore } from '../Store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

const Home = () => {
  const { authUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="bg-gray-800 h-screen w-full flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-950 mb-6">
          Welcome to Chat App
        </h1>

        {authUser && (
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {authUser.username?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Hello, {authUser.username}!
            </h2>
            <p className="text-sm text-gray-500 mt-1">{authUser.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-700 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Home