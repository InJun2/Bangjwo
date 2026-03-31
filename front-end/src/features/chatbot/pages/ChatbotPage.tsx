import { useState } from "react";
import FloatingChatbot from "../components/FloatingChatbot";

interface Message {
  id: number;
  sender: "user" | "chatbot";
  text: string;
  timestamp: string;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "chatbot",
      text: "무엇을 물어보시겠어요?",
      timestamp: new Date().toTimeString().slice(0, 5),
    },
  ]);

  return (
    <div className="relative pb-10">
      {<FloatingChatbot messages={messages} setMessages={setMessages} />}
    </div>
  );
};

export default ChatbotPage;
