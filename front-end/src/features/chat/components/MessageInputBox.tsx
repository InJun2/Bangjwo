import { useState } from "react";
import { ChatMessage } from "../../../types/chatTypes";

interface Props {
  onSend: (chatMessage: string) => ChatMessage[] | void; // 메시지 전송 콜백
  onAttachClick?: () => void; // 문서 아이콘 눌렀을 때 콜백
}

const MessageInputBox = ({ onSend, onAttachClick }: Props) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
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
    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-light200">
      {/* 문서 아이콘 버튼 */}
      <button
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer"
        onClick={onAttachClick}
      >
        <span className="material-symbols-rounded text-[20px] text-black">
          description
        </span>
      </button>

      {/* 메시지 입력창 */}
      <input
        type="text"
        placeholder="메시지 입력"
        className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-neutral-dark100 placeholder:text-neutral-gray outline-none border border-neutral-light200"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* 전송 아이콘 버튼 */}
      <button
        onClick={handleSend}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
      >
        <span className="material-symbols-rounded text-[20px] text-black cursor-pointer">
          send
        </span>
      </button>
    </div>
  );
};

export default MessageInputBox;


// import { useState } from "react";

// interface Props {
//   onSend: (text: string) => void;
//   onAttachClick?: () => void; // 문서 아이콘 눌렀을 때 콜백
// }

// const MessageInputBox = ({ onSend, onAttachClick }: Props) => {
//   const [message, setMessage] = useState("");

//   const handleSend = () => {
//     if (message.trim()) {
//       onSend(message.trim());
//       setMessage("");
//     }
//   };

//   return (
//     <div className="flex items-center gap-2 px-3 py-2 bg-neutral-light200">
//       {/* 문서 아이콘 버튼 */}
//       <button
//         className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer"
//         onClick={onAttachClick}
//       >
//         <span className="material-symbols-rounded text-[20px] text-black">
//           description
//         </span>
//       </button>

//       {/* 메시지 입력창 */}
//       <input
//         type="text"
//         placeholder="메시지 입력"
//         className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-neutral-dark100 placeholder:text-neutral-gray outline-none border border-neutral-light200"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleSend()}
//       />

//       {/* 전송 아이콘 버튼 */}
//       <button
//         onClick={handleSend}
//         className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
//       >
//         <span className="material-symbols-rounded text-[20px] text-black cursor-pointer">
//           send
//         </span>
//       </button>
//     </div>
//   );
// };

// export default MessageInputBox;
