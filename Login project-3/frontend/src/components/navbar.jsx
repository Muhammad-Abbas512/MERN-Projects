import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../api/auth'

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.log(err);
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="bg-gray-800 text-white p-9 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Authentication</h1>

        <div className=" space-x-4 mt-4 justify-center text-[19px] font-semibold flex gap-13">
            <Link to="/" className="hover:text-gray-400">Home</Link>
            {!user && <Link to="/login" className="hover:text-gray-400">Login</Link>}
            {!user && <Link to="/register" className="hover:text-gray-400">Register</Link>}
        </div>


        <div>
            {user ? (
              <button
                onClick={handleLogout}
                className="hover:text-gray-400 bg-red-600 rounded-[10px] p-4 py-3 text-white font-bold text-[20px] cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link to="/profile" className="hover:text-gray-400 bg-blue-900 rounded-[10px] p-4 py-3 text-white font-bold text-[20px]">Profile</Link>
            )}
        </div>
    </div>
  )
}

export default Navbar