 import { PhoneMissed } from "lucide-react";

const MissedCallMessage = ({ isOwn, time }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[65%] lg:max-w-md px-3 py-2 shadow-sm rounded-lg ${
          isOwn ? "bg-[#d9fdd3] rounded-tr-sm" : "bg-white rounded-tl-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <PhoneMissed className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-medium text-gray-900">
              {isOwn ? "Missed voice call" : "Missed voice call"}
            </span>
            <span className="text-xs text-gray-500">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissedCallMessage;