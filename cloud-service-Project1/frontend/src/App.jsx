import React from 'react'
import Feed from './pages/feed.jsx'
import CreatePost from './pages/create-post.jsx'
import {Routes, Route} from 'react-router-dom'

const App = () => {
  return (
    <div className="bg-neutral-950 min-h-screen">

      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>

    </div>
  )
}

export default App
