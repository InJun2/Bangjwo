import { useState } from "react";
import Chatbot from "./Chatbot";

interface Message {
  id: number;
  sender: "user" | "chatbot";
  text: string;
  timestamp: string;
}

const FloatingChatbot = () => {
  // 🚀 핵심 포인트: 부모 컴포넌트에서 렌더링을 시작할 때 'true'로 둬서 챗봇이 바로 열리게 합니다!
  const [isOpen, setIsOpen] = useState(true); 
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "chatbot",
      text: "무엇을 물어보시겠어요?",
      timestamp: new Date().toTimeString().slice(0, 5),
    },
  ]);

  return (
    <div className="flex flex-col items-end">
      
      {/* 챗봇 창 영역 */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 mb-4 visible"
            : "scale-0 opacity-0 h-0 w-0 invisible"
        }`}
      >
        <div className="relative shadow-2xl rounded-lg bg-neutral-light300 w-[360px] h-[520px]">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 bg-neutral-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-neutral-600 transition z-10"
          >
            닫기 ✕
          </button>

          {/* 실제 챗봇 컴포넌트 */}
          <Chatbot messages={messages} setMessages={setMessages} />
        </div>
      </div>

      {/* 챗봇 열기 플로팅 버튼 (챗봇 창을 닫았을 때만 보임) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#FFD700] rounded-full shadow-2xl flex items-center justify-center text-neutral-900 text-3xl hover:scale-105 transition-transform"
        >
          💬
        </button>
      )}

    </div>
  );
};

export default FloatingChatbot;