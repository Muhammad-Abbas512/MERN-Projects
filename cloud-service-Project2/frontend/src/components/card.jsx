import React from "react";
import { Trash2, Loader2 } from "lucide-react";

/**
 * PostCard
 *
 * Props:
 * - image: string (image URL or object URL)
 * - caption: string
 * - onDelete: function, called when the delete button is clicked
 */




const PostCard = ({ image, caption, onDelete, isDeleting }) => {
  return (
    <div className="relative group rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-lg">
      {/* Image */}
      <div className="relative">
        <img
          src={image}
          alt={caption || "Post image"}
          className="w-full h-72 object-cover"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

        {/* Delete button — appears on hover, top right, red */}
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label="Delete post"
          className="absolute top-3 cursor-pointer right-3 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg
            opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div className="p-4">
          <p className="text-neutral-200 text-sm leading-relaxed break-words">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostCard;