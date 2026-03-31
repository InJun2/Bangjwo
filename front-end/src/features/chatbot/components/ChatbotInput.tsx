import { useState } from "react";

interface ChatbotInputProps {
  onSend: (message: string) => void;
}

const ChatbotInput = ({ onSend }: ChatbotInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-12 px-4 flex items-center border-t border-neutral-light200 bg-white">
      <input
        className="flex-1 bg-transparent outline-none text-sm text-neutral-black placeholder-neutral-gray"
        type="text"
        placeholder="메시지 입력"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        onClick={handleSend}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors ml-2"
      >
        <span 
          className="material-symbols-rounded text-2xl text-black flex items-center justify-center leading-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          arrow_forward
        </span>
      </button>
    </div>
  );
};

export default ChatbotInput;