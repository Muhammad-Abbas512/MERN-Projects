import MessageTime from "./MessageTime";

const ChatBubble = ({ sender = "other", message, time, seen = false, image }) => {
  const isOwn = sender === "me";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
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
            className="rounded mb-1 max-w-full max-h-60 object-cover"
          />
        )}
        {message && (
          <p className="font-normal text-[15px] leading-6 text-gray-900 wrap-break-words">
            {message}
          </p>
        )}
        <MessageTime time={time} seen={seen} isOwn={isOwn} />
      </div>
    </div>
  );
};

export default ChatBubble;