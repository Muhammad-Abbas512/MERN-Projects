import { Check, CheckCheck } from "lucide-react";

const MessageTime = ({ time, seen = false, isOwn = false, status = "sent" }) => {
  // Determine tick color based on status
  // sent: single grey tick
  // delivered: double grey tick
  // seen: double red tick
  const getTickColor = () => {
    if (status === "seen") return "text-red-500";
    if (status === "delivered") return "text-gray-500";
    return "text-gray-400";
  };

  const getTickIcon = () => {
    if (status === "sent") {
      // Single tick
      return <Check className={`w-4 h-4 ${getTickColor()}`} />;
    }
    // Double tick for delivered and seen
    return <CheckCheck className={`w-4 h-4 ${getTickColor()}`} />;
  };

  return (
    <div className="flex justify-end items-center gap-1 mt-1 shrink-0">
      <span className="text-[11px] text-gray-500 leading-none">
        {time}
      </span>
      {isOwn && getTickIcon()}
    </div>
  );
};

export default MessageTime;
