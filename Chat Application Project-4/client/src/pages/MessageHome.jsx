import React from 'react'
import Sidebar from '../components/Messages/sidebar'

const image = "/chat_4961838.png"

const MessageHome = () => {
  return (
    <div className="bg-[#f0f2f5] h-screen flex w-full">
      <div className="w-full lg:w-96 flex shrink-0 h-full border-r border-gray-200">
        <Sidebar />
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <img
            src={image}
            alt="Chat Illustration"
            className="mx-auto w-80 md:w-96 h-auto"
          />

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Chatify
          </h2>

          <p className="mt-2 text-gray-500">
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageHome
