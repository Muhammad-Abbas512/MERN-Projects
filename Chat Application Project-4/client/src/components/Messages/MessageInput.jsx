import { useState, useRef, useEffect } from "react";
import { Send, Image, Smile, X } from "lucide-react";
import { useChatStore } from "../../Store/useChatStore";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { sendMessage } = useChatStore();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result); // base64
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() && !image) return;

    sendMessage({ text: message, image });
    setMessage("");
    removeImage();
  };

  return (
    <div className="p-4 m-2 border-t bg-white text-gray-900 rounded-3xl">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-40 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
          aria-label="Add image"
        >
          <Image className="w-5 h-5 text-gray-500" />
        </button>

        <button
          type="button"
          className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Add emoji"
        >
          <Smile className="w-5 h-5 text-gray-500" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={!message.trim() && !image}
          className="p-2 bg-blue-500 cursor-pointer text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;