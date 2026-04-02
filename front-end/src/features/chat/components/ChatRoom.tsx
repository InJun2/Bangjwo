import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "./ChatBubble";
import MessageInputBox from "./MessageInputBox";
import DateBadge from "./DateBadge";
import SystemMessage from "./SystemMessage";
import ContractActionButton from "./ContractActionButton";
import { connectSocket } from "../../../utils/chatSocket";
import { useChatStore } from "../../../store/chatStore";
import { useAuth } from "../../../contexts/AuthContext";
import { useCreateContract } from "../../../apis/contract";
import { useQueryClient } from "@tanstack/react-query";

interface ChatRoomProps {
  chatId: number | null;
}

const ChatRoom = ({ chatId }: ChatRoomProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showContractButton, setShowContractButton] = useState(false);
  const { chatRoom, setChatRoom } = useChatStore();
  const { user } = useAuth();
  
  const createContractMutation = useCreateContract();
  const queryClient = useQueryClient();

  const myId = Number(user?.sub);

  const [messages, sendSocketMessage] = connectSocket(chatId, scrollRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (chatId === null || chatId === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-gray text-lg">
        문의하기를 선택해주세요
      </div>
    );
  }

  const chatTitle = chatRoom
    ? `월세 ${chatRoom.deposit}/${chatRoom.monthly}`
    : "월세";

  const handleOpenContract = (mode: "seller" | "buyer") => {
    if (chatId === null || !chatRoom?.roomId) return;

    const currentContractId = chatRoom.contractId || 0;

    if (currentContractId > 0) {
      window.open(`/${mode}-contract/${chatRoom.roomId}/${currentContractId}`, "_blank", "noopener,noreferrer");
      setShowContractButton(false);
      return;
    }

    if (currentContractId === 0) {
      if (mode === "buyer") {
        alert("임대인이 먼저 계약서를 작성(생성)해야 합니다. 임대인에게 요청해주세요!");
        setShowContractButton(false);
        return; 
      }

      // 3. 임대인(seller)일 경우 백엔드에 생성 요청!
      createContractMutation.mutate(
        { 
          roomId: chatRoom.roomId,
          tenantId: chatRoom.otherId // 🚀 핵심 추가: 상대방(임차인)의 ID를 같이 보냅니다!
        } as any, 
        {
          onSuccess: (newContractId) => {
            console.log("새로운 계약서 생성 완료! 발급된 ID:", newContractId);

            queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
            
            setChatRoom({ 
              ...chatRoom, 
              contractId: newContractId 
            });

            window.open(`/${mode}-contract/${chatRoom.roomId}/${newContractId}`, "_blank", "noopener,noreferrer");
            setShowContractButton(false);
          },
          onError: (error) => {
            alert("계약서 생성에 실패했습니다. (권한 없음 등)");
            console.error("계약서 생성 에러:", error);
          }
        }
      );
    }
  };

  // 메시지와 날짜 배지를 함께 렌더링하는 함수
  const renderMessagesWithDateBadge = () => {
    const result: React.ReactNode[] = [];
    let lastDate: string | null = null;

    if (Array.isArray(messages)) {
      messages.forEach((msg, index) => {
        if (msg.sendAt.slice(0, 10) !== lastDate) {
          result.push(
            <div key={`date-${index}`} className="flex justify-center my-2">
              <DateBadge date={msg.sendAt.slice(0, 10)} />
            </div>
          );
          lastDate = msg.sendAt.slice(0, 10);
        }
        if (msg.type === "system" && "role" in msg) {
          if (msg.role === "임대인" || msg.role === "임차인") {
            result.push(
              <SystemMessage key={`system-${index}`} role={msg.role} />
            );
          }
        } else {
          result.push(
            <ChatBubble
              text={msg.message}
              time={msg.sendAt.slice(11, 16)}
              key={index}
              {...msg}
              type={myId === msg.senderId ? "sent" : "received"}
            />
          );
        }
      });
    }

    return result;
  };

  return (
    <div className="w-full h-full flex flex-col border border-neutral-light200 rounded-2xl shadow-xl overflow-hidden">
      <ChatHeader
        title={chatTitle}
        onMenuClick={() => {
          // TODO: 메뉴 클릭 시 처리 로직 추가
          console.log("redirect to room find page");
          // redirect()
        }}
      />
      <div className="flex-1 overflow-y-auto bg-white p-4 custom-scroll">
        {renderMessagesWithDateBadge()}
        <div ref={scrollRef} />
      </div>
      <div className="flex">
        {showContractButton && (
          <ContractActionButton
            text="[임대인] 계약서 작성하기"
            onClick={() => handleOpenContract("seller")} // 👈 수정됨
          />
        )}
        {showContractButton && (
          <ContractActionButton
            text="[임차인] 계약서 작성하기"
            onClick={() => handleOpenContract("buyer")} // 👈 수정됨
          />
        )}
      </div>
      <MessageInputBox
        onSend={
          typeof sendSocketMessage === "function" ? sendSocketMessage : () => {}
        }
        onAttachClick={() => setShowContractButton((prev) => !prev)}
      />
    </div>
  );
};

export default ChatRoom;