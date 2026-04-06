package com.bangjwo.chat.application.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.bangjwo.chat.application.dto.ChatRoomDto;
import com.bangjwo.chat.domain.entity.ChatRoom;
import com.bangjwo.chat.domain.repository.ChatRoomRepository;
import com.bangjwo.global.common.error.chat.ChatErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.notification.application.NotificationService;
import com.bangjwo.notification.domain.vo.NotificationMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomServiceImpl implements ChatRoomService {

	private final ChatRoomRepository chatRoomRepository;
	private final NotificationService notificationService;

	@Override
	public ChatRoomDto.ChatResponseDto requestClass(ChatRoomDto.ChatRequestDto chatRequestDto) {
		try {
			ChatRoom chatRoom;
			// 기존 채팅방 조회
			Optional<ChatRoom> chatRoomOptional = chatRoomRepository.findByRoomIdAndTenantId(
				chatRequestDto.roomId(), chatRequestDto.tenantId());

			// 존재하지 않으면 새로 생성
			chatRoom = chatRoomOptional.orElseGet(() -> {
				try {
					ChatRoom newRoom = chatRoomRepository.saveAndFlush(ChatRoom.builder()
						.landlordId(chatRequestDto.landlordId())
						.tenantId(chatRequestDto.tenantId())
						.roomId(chatRequestDto.roomId())
						.landloadUnreadCount(0L)
						.tenantUnreadCount(0L)
						.createdAt(LocalDateTime.now())
						.build());

					notificationService.sendNotification(
						chatRequestDto.landlordId(),
						NotificationMessage.CHAT_REQUEST
					);

					return newRoom;
				} catch (Exception e) {
					log.error("채팅방 저장 실패", e);
					throw new BusinessException(ChatErrorCode.CHAT_ROOM_SAVE_FAILED);
				}
			});

			if (chatRoom == null) {
				throw new BusinessException(ChatErrorCode.CHAT_ROOM_NOT_FOUND);
			}

			return ChatRoomDto.ChatResponseDto.builder()
				.landlordId(chatRoom.getLandlordId())
				.tenantId(chatRoom.getTenantId())
				.roomId(chatRoom.getRoomId())
				.chatRoomId(chatRoom.getId())
				.build();
		} catch (BusinessException ce) {
			throw ce;
		} catch (Exception e) {
			log.error("채팅방 요청 처리 중 오류 발생", e);
			throw new BusinessException(ChatErrorCode.CHAT_ROOM_SAVE_FAILED);
		}
	}
}
