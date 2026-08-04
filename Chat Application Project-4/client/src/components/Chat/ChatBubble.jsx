import { useState } from "react";
import MessageTime from "./MessageTime";
import { X, Download, Loader2 } from "lucide-react";

const ChatBubble = ({ sender = "other", message, time, seen = false, status = "sent", image }) => {
  const isOwn = sender === "me";
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleImageClick = () => {
    if (image) {
      setIsImageViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setIsImageViewerOpen(false);
  };

  // Download image with save dialog
  const handleDownload = async () => {
    if (!image) return;
    setIsDownloading(true);

    try {
      // Fetch the image as a blob so the browser shows a save dialog
      const response = await fetch(image, { mode: "cors" });
      const blob = await response.blob();

      // Get a filename from the URL or use a timestamp
      const urlParts = image.split("/");
      let filename = urlParts[urlParts.length - 1] || "image.jpg";
      // Remove query params from filename
      filename = filename.split("?")[0];

      // Create an object URL and trigger download
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab if blob download fails
      window.open(image, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
        <div
          className={`max-w-[65%] lg:max-w-md px-3 py-2 shadow-sm ${
            isOwn
              ? "bg-[#d9fdd3] rounded-lg rounded-tr-sm"
              : "bg-white rounded-lg rounded-tl-sm"
          }`}
        >
          {image && (
            <img
              src={image}
              alt="attachment"
              onClick={handleImageClick}
              className="rounded mb-1 max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          )}
          {message && (
            <p className="font-normal text-[15px] leading-6 text-gray-900 wrap-break-words break-all">
              {message.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                if (part.match(/^https?:\/\//)) {
                  return (
                    <a
                      key={index}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              })}
            </p>
          )}
          <MessageTime time={time} seen={seen} isOwn={isOwn} status={status} />
        </div>
      </div>

      {/* Image Viewer Modal */}
      {isImageViewerOpen && image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleCloseViewer}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={handleCloseViewer}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close image viewer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="absolute -top-12 right-12 p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Download image"
            >
              {isDownloading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Download className="w-6 h-6" />
              )}
            </button>

            {/* Image */}
            <img
              src={image}
              alt="Full size attachment"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            {/* Caption */}
            {message && (
              <p className="text-white text-center mt-4 text-sm">{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBubble;