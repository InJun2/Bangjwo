// types/chatTypes.ts

// 채팅방 생성 요청
export interface CreateChatRoomRequest {
    roomId: number;       // 매물 ID
    tenantId: number;
    landlordId: number;
  }
  
  // 채팅방 생성 응답
  export interface CreateChatRoomResponse {
    chatRoomId: number;
    tenantId: number;
    landlordId: number;
    roomId: number;
  }
  
  // 채팅방 목록 응답
  export interface ChatRoomListResponse {
    chatRooms: {
      chatRoomId: number;
      auctionTitle: string;
      lastMessage: string;
      updatedAt: string;
    }[];
  }
  
  // 채팅 메시지 응답
  export interface ChatMessagesResponse {
    chatRoomId: number;
    messages: {
      messageId: number;
      senderId: number;
      content: string;
      createdAt: string;
    }[];
  }

  export interface ChatMessage {
    type: string;
    chatRoomId: number;
    roomId: number;
    chatId: number;
    receiverId: number;
    senderId: number;
    senderNickname: string;
    message: string;
    sendAt: string; // ISO 문자열
    isReadByMe: boolean;
  }

  export interface RequestMessage {
    type: string;
    chatRoomId: number;
    roomId: number;
    receiverId: number;
    senderId: number;
    senderNickname: string;
    message: string;
    sendAt: string; // ISO 문자열
    isReadByMe: boolean;
  }
  
  
  export type MessageType = "sent" | "received" | "system";

// export interface Message {
//   id: number;
//   type: MessageType;
//   text: string;
//   time: string;
//   date: string;
//   senderName?: string;
//   avatarUrl?: string;
//   isReadByMe?: boolean;
//   isReadByPartner?: boolean;
//   role?: "임대인" | "임차인"; // 시스템 메시지에만 사용
// }

export interface ChatRoomSummary {
    chatRoomId: number;
    roomId: number;
    contractId?: number;
    lastMessage: string;
    profileImage: string;
    nickname: string;
    sendAt: string;
    unreadCount: number;
    deposit: number;
    monthly: number;
    role: "임대인" | "임차인";
    otherId: number;
    roomImage: string;
  }
  