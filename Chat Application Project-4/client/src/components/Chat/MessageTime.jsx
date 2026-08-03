import { Check, CheckCheck } from "lucide-react";

const MessageTime = ({ time, seen = false, isOwn = false }) => {
  return (
    <div className="flex justify-end items-center gap-1 mt-1 shrink-0">
      <span className="text-[11px] text-gray-500 leading-none">
        {time}
      </span>
      {isOwn && (
        seen ? (
          <CheckCheck className="w-4 h-4 text-sky-500" />
        ) : (
          <Check className="w-4 h-4 text-gray-400" />
        )
      )}
    </div>
  );
};

export default MessageTime;