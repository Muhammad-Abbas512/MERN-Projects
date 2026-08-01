import React, { useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'

const Home = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <div className="p-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Welcome to the Home Page {user ? user.username : "Developer"}</h1>
        <p className="mt-4">This is a simple home page for the authentication app.</p>
      </div>
      <Footer/>
    </div>
  )
}

export default Home