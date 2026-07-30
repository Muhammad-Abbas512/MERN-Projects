import React, { useState, useEffect, useCallback } from 'react'
import PostCard from '../components/card.jsx'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const POSTS_PER_PAGE = 6

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState(null)

  const fetchPosts = useCallback(async (pageNum) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`http://localhost:3000/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`)
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? "Couldn't reach the server. Is it running on localhost:3000?"
          : 'Something went wrong while loading posts.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(page)
  }, [page, fetchPosts])

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    setDeletingId(postId)
    try {
      const res = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)

      // If the current page becomes empty after deletion, go back one page
      if (posts.length === 1 && page > 1) {
        setPage((prev) => prev - 1)
      } else {
        // Refetch to get updated totalPages from the server
        fetchPosts(page)
      }
    } catch (err) {
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-lg">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading posts...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <p className="text-red-400 text-lg text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10">

    <div>
      <Link to="/create-post" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        Create Post
      </Link>
    </div>



      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Feed</h1>

        {posts.length === 0 ? (
          <p className="text-neutral-500 text-center text-lg">No posts yet. Be the first to share something!</p>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  image={post.image}
                  caption={post.caption}
                  onDelete={() => handleDelete(post._id)}
                  isDeleting={deletingId === post._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Feed