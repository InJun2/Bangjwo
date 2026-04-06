package com.bangjwo.chat.application.service;

import java.util.List;

import com.bangjwo.chat.application.dto.ChatMessageResponseDto;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.bangjwo.chat.application.convert.ChatCoverter;
import com.bangjwo.chat.application.dto.ChatMessageDto;
import com.bangjwo.chat.application.dto.ChatRoomSummary;
import com.bangjwo.chat.domain.entity.ChatMessage;
import com.bangjwo.chat.domain.repository.ChatMongoRepository;
import com.bangjwo.global.common.error.chat.ChatErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.notification.application.NotificationService;
import com.bangjwo.notification.domain.vo.NotificationMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageServiceImpl implements ChatMessageService {

	private final ChatMongoRepository chatMongoRepository;
	private final MongoTemplate mongoTemplate;
	private final RedisChatRoomService redisChatRoomService;
	private final NotificationService notificationService;

	@Override
	public void saveChatMessage(ChatMessageDto dto, boolean isReceiverOnline) {
		// Redis에서 채팅방 정보를 조회
		ChatRoomSummary info = redisChatRoomService.getChatRoomInfo(dto.senderId(), dto.chatRoomId());
		if (info == null) {
			log.error("채팅방 정보가 존재하지 않습니다. (chatRoomId: {})", dto.chatRoomId());
			throw new BusinessException(ChatErrorCode.CHAT_ROOM_NOT_FOUND);
		}

		log.info("받는사람 : {} , 메시지 내용 : {}", info.getOtherId(), dto.message());
		try {
			// ChatCoverter의 create 메서드를 통해 ChatMessage 객체 생성
			ChatMessage chatMessage = ChatCoverter.create(dto, info, isReceiverOnline);
			chatMongoRepository.save(chatMessage);
			log.info("채팅 메시지 저장 성공");

			if (!isReceiverOnline) {
				notificationService.sendNotification(
					info.getOtherId(),
					NotificationMessage.CHAT_REQUEST,
					dto.chatRoomId()
				);
			}
		} catch (Exception e) {
			log.error("채팅 메시지 저장 실패", e);
			throw new BusinessException(ChatErrorCode.CHAT_MESSAGE_SAVE_FAILED);
		}
	}

	@Override
	public void markMessagesAsRead(Long chatRoomId, Long userId) {
		Query query = new Query();
		query.addCriteria(Criteria.where("chatRoomId").is(chatRoomId)
			.and("senderId").ne(userId)
			.and("read").is(false));
		Update update = new Update().set("read", true);
		try {
			// 메시지 읽음 처리
			var result = mongoTemplate.updateMulti(query, update, ChatMessage.class);
			log.info("{}개의 메시지를 읽음 처리함", result.getModifiedCount());
		} catch (Exception e) {
			log.error("메시지 읽음 처리 실패", e);
			throw new BusinessException(ChatErrorCode.CHAT_MESSAGE_UPDATE_FAILED);
		}
	}

	@Override
	public List<ChatMessageResponseDto> getChatMessages(Long chatRoomId) {
		try {
			return chatMongoRepository.findByChatRoomIdOrderBySendAtAsc(chatRoomId);
		} catch (Exception e) {
			log.error("채팅 내역 조회 실패", e);
			throw new BusinessException(ChatErrorCode.CHAT_MESSAGE_RETRIEVE_FAILED);
		}
	}
}
