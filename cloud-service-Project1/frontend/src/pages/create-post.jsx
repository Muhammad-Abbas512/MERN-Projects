import React, { useState, useRef, useCallback } from "react";
import { ImagePlus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const MAX_SIZE_MB = 8;
const CAPTION_LIMIT = 200;
const API_URL = "http://localhost:3000/create-post";

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const validateAndSetImage = useCallback((file) => {
    if (!file) return;
    setErrorMsg("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("That file isn't an image. Try a JPG, PNG, or GIF.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`That image is too large. Keep it under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleImageChange = (e) => {
    validateAndSetImage(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetImage(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!image || !caption.trim()) {
      setErrorMsg("Add an image and a caption before posting.");
      return;
    }

    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", caption.trim());

      const res = await fetch("http://localhost:3000/create-post", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      setStatus("success");
      setCaption("");
      removeImage();

      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "Couldn't reach the server. Is it running on localhost:3000?"
          : "Something went wrong while posting. Try again."
      );
    }
  };

  const isSubmitting = status === "loading";

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 tracking-tight">
          Create new post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload Image */}
          <div>
            <label className="block text-neutral-300 font-medium mb-3 text-sm">
              Image
            </label>

            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                className={`cursor-pointer flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-xl transition-colors
                  ${isDragging
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-neutral-700 hover:border-neutral-500"
                  }`}
              >
                <ImagePlus className="w-10 h-10 text-neutral-500 mb-3" strokeWidth={1.5} />
                <p className="text-neutral-300 font-medium">
                  Drop an image here, or click to browse
                </p>
                <p className="text-neutral-500 text-sm mt-1">
                  PNG, JPG or GIF · up to {MAX_SIZE_MB}MB
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Selected image preview"
                  className="rounded-xl w-full h-52 object-cover"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 flex items-center gap-1 bg-neutral-900/90 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
                <div className="absolute bottom-3 left-3 bg-neutral-900/90 text-neutral-300 text-xs px-2 py-1 rounded-md truncate max-w-[70%]">
                  {image?.name}
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-neutral-300 font-medium mb-2 text-sm">
              Caption
            </label>

            <textarea
              id="caption"
              rows="4"
              maxLength={CAPTION_LIMIT}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share something..."
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-neutral-500"
            />

            <div className="text-right text-neutral-500 text-xs mt-1.5">
              {caption.length}/{CAPTION_LIMIT}
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success message */}
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Post created.</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 cursor-pointer rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors text-white font-semibold text-base flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              "Create post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;