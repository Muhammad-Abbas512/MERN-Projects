import React from 'react'
import Sidebar from '../components/Messages/sidebar'
import {Search} from 'lucide-react'

const image = "/chat_4961838.png"

const MessageHome = () => {
  return (
    <div className="bg-gray-950 h-screen flex">
      <div className="w-80 ">
        <Sidebar />
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <img
            src={image}
            alt="Chat Illustration"
            className="mx-auto w-80 md:w-96 h-auto"
          />

          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to Chatify
          </h2>

          <p className="mt-2 text-gray-400">
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageHome