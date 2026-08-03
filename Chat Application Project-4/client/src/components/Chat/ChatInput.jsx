import { useState, useRef } from "react";
import { Send, Image, Smile, X } from "lucide-react";
import { useChatStore } from "../../Store/useChatStore";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { sendMessage } = useChatStore();
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
    <div className="px-4 py-3 rounded-2xl bg-[#f0f2f5]">
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
            className="absolute -top-2 -right-2 p-1 bg-gray-700 text-white rounded-full hover:bg-gray-800 cursor-pointer"
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
          className="p-2 hover:bg-gray-200 cursor-pointer rounded-full transition-colors"
          aria-label="Add image"
        >
          <Image className="w-6 h-6 text-gray-600" />
        </button>

        <button
          type="button"
          className="p-2 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Add emoji"
        >
          <Smile className="w-6 h-6 text-gray-600" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-2.5 bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#00a884] text-[15px] text-gray-900"
        />

        <button
          type="submit"
          disabled={!message.trim() && !image}
          className="p-2.5 bg-[#00a884] cursor-pointer text-white rounded-full hover:bg-[#008f72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;