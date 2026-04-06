package com.bangjwo.chat.presentation;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.bangjwo.auth.resolver.MemberHeader;
import com.bangjwo.chat.application.convert.AlertConverter;
import com.bangjwo.chat.application.dto.ChatMessageDto;
import com.bangjwo.chat.application.dto.ChatMessageResponseDto;
import com.bangjwo.chat.application.dto.ChatRoomDto;
import com.bangjwo.chat.application.dto.ChatRoomSummary;
import com.bangjwo.chat.application.service.ChatAlertService;
import com.bangjwo.chat.application.service.ChatMessageService;
import com.bangjwo.chat.application.service.ChatRoomService;
import com.bangjwo.chat.application.service.RedisChatRoomService;
import com.bangjwo.chat.domain.entity.ChatAlert;
import com.bangjwo.chat.infrastructure.WebSocketSessionTracker;
import com.bangjwo.global.common.error.chat.ChatErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.notification.application.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Chat", description = "채팅 관련 API")
@Controller()
@RequestMapping("/api/v1/chat")
@Slf4j
@RequiredArgsConstructor
public class ChatRoomController {

	private final ChatRoomService chatroomService;
	private final ChatMessageService chatMessageService;
	private final ChatAlertService chatAlertService;
	private final RedisChatRoomService redisChatRoomService;
	private final SimpMessagingTemplate messagingTemplate;
	private final WebSocketSessionTracker webSocketSessionTracker;
	private final NotificationService notificationService;
	private final ObjectMapper objectMapper;

	/*
	 * 채팅방 생성
	 * 세입자만 채팅방을 생성할 수 있음
	 * */
	@Operation(
		summary = "채팅방 생성",
		description = "세입자가 새로운 채팅방을 생성합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "채팅방 생성 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		}
	)
	@PostMapping("/new")
	public ResponseEntity<ChatRoomDto.ChatResponseDto> createChatRoom(
		@RequestBody ChatRoomDto.ChatRequestDto chatRequestDto) {

		ChatRoomDto.ChatResponseDto response = chatroomService.requestClass(chatRequestDto);

		// 채팅방이 생성되면 Redis에 새로 채팅방 추가.
		redisChatRoomService.createChatRoom(response);

		// 채팅방 생성되면 프론트는 해당 엔드포인트 구독
		return ResponseEntity.ok().body(response);
	}

	/*
	 * 채팅방 입장(채팅 내역 불러오기)
	 * MongoDB에 있는 채팅 중 read false 를 true 로 변경
	 * Redis에 있는 해당 채팅방 정보 업데이트 : 안읽은 메세지 0으로 업데이트
	 * */
	@Operation(
		summary = "채팅방 입장",
		description = "채팅방에 입장하며, 채팅 내역과 알림의 읽음 상태를 업데이트합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "채팅 내역 조회 및 읽음 처리 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		},
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/enter/{chatRoomId}")
	public ResponseEntity<List<ChatMessageResponseDto>> getChatMessages(
		@MemberHeader() Long userId,
		@PathVariable("chatRoomId") Long chatRoomId) {

		webSocketSessionTracker.roomConnect(chatRoomId, userId);
		log.info("유저({})가 채팅방({})에 입장했습니다.", userId, chatRoomId);

		// 몽고 DB에 해당 채팅방 채팅 읽음 처리
		chatMessageService.markMessagesAsRead(chatRoomId, userId);

		// 몽고 DB에 해당 채팅방 알림 읽음 처리
		chatAlertService.markAlertAsRead(chatRoomId, userId);

		// Redis에 해당 채팅방 읽음 처리
		redisChatRoomService.updateChatRoom(chatRoomId, userId);

		String relatedUrl = "/chat/" + chatRoomId;
		notificationService.markAsReadByUrl(userId, relatedUrl);

		return ResponseEntity.ok(chatMessageService.getChatMessages(chatRoomId));
	}

	/*
	 * 채팅 전송
	 * Redis에 있는 해당 채팅방 정보 업데이트
	 * 	- 채팅 내역과 날짜 업데이트 + (상대방이 안들어왔다면(안읽음 +1) || 상대방이 들어와 있다면 안읽음 업데이트X )
	 * MongoDB에 채팅 내역 저장
	 * 상대방이 web-socket에 접속해 있다면 그냥 보내기
	 * web-socket에 접속해 있지 않다면, 알림
	 * */
	@Operation(
		summary = "채팅 메시지 전송",
		description = "실시간 채팅 메시지를 전송하며, Redis 및 MongoDB에 채팅 내역과 상태를 업데이트합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "채팅 메시지 전송 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		}
	)
	@MessageMapping("/message")
	public void sendMessage(ChatMessageDto dto) {
		log.info("메시지 수신: {}", dto);

		Long chatRoomId = dto.chatRoomId();
		Long senderId = dto.senderId();

		ChatRoomSummary chatRoom = redisChatRoomService.getChatRoomInfo(senderId, chatRoomId);

		Long receiverId = chatRoom.getOtherId();
		String senderImage = chatRoom.getProfileImage();

		// 상대방 접속여부 확인
		boolean isReceiverOnline = webSocketSessionTracker
			.isUserOnlineInRoom(chatRoomId, receiverId);

		// Redis에 채팅방 정보 업데이트
		redisChatRoomService.updateLastMessages(dto, isReceiverOnline);

		// 몽고 DB 채팅 저장
		chatMessageService.saveChatMessage(dto, isReceiverOnline);

		// 채팅 전송
		messagingTemplate.convertAndSend(
			"/sub/chat/room/" + chatRoomId, dto);

		/*
		 * 상대방이 구독이 안되어있을 경우 알림 전송
		 * 프론트는 회원이 로그인하자마자 웹소켓 구독을 해줘야함
		 * "/sub/alert/" + userId
		 * */
		if (!isReceiverOnline) {
			ChatAlert alert = AlertConverter.createAlert(dto, receiverId, senderImage);

			boolean isReceiverLogin = webSocketSessionTracker.isUserOnlineInAlert(chatRoomId, receiverId);
			if (isReceiverLogin) {
				messagingTemplate.convertAndSend(
					"/sub/alert/" + receiverId,
					alert
				);
				log.info("알림 전송");
			} else {
				// 몽고디비에 저장
				chatAlertService.saveAlert(alert);
				log.info("몽고디비 알림 저장");
			}
		}
	}

	/*
	 * 채팅 리스트 조회 : Redis에 있는 목록 가져오기
	 * JSON 값을 파싱하여 사용
	 * */
	@Operation(
		summary = "채팅방 목록 조회",
		description = "Redis에 저장된 채팅방 목록을 조회합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "채팅방 목록 조회 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		},
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/list")
	public ResponseEntity<List<ChatRoomSummary>> getChatRooms(@MemberHeader Long userId) {
		Set<ZSetOperations.TypedTuple<String>> rawRooms = redisChatRoomService.getRoomList(userId);

		List<ChatRoomSummary> summaries = rawRooms.stream().map(tuple -> {
			try {
				return objectMapper.readValue(tuple.getValue(), ChatRoomSummary.class);
			} catch (JsonProcessingException e) {
				throw new BusinessException(ChatErrorCode.CHAT_REDIS_SERIALIZATION_FAILED);
			}
		}).collect(Collectors.toMap(
				ChatRoomSummary::getChatRoomId,
				summary -> summary,
				(existing, replacement) -> existing,
				LinkedHashMap::new
			))
			.values().stream()
			.collect(Collectors.toList());

		return ResponseEntity.ok(summaries);
	}

	/*
	 * 단일 채팅방 정보 조회 (계약서 상태 등 최신 정보 확인용)
	 */
	@Operation(
		summary = "단일 채팅방 정보 조회",
		description = "특정 채팅방의 최신 상태(계약서 ID 등)를 조회합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		},
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/info/{chatRoomId}")
	public ResponseEntity<ChatRoomSummary> getChatRoomInfo(
		@MemberHeader Long userId,
		@PathVariable Long chatRoomId) {
		ChatRoomSummary chatRoom = redisChatRoomService.getChatRoomInfo(userId, chatRoomId);

		return ResponseEntity.ok(chatRoom);
	}

	/*
	 * 채팅방 나가기(web-socket 구독 해제)
	 * */
	@Operation(
		summary = "채팅방 나가기",
		description = "채팅방에서 나가며 웹소켓 구독을 해제합니다.",
		responses = {
			@ApiResponse(responseCode = "200", description = "채팅방 나가기 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류")
		}
	)
	@PostMapping("/leave/{chatRoomId}")
	public ResponseEntity<String> leaveChatRoom(
		@MemberHeader() Long userId,
		@PathVariable("chatRoomId") Long chatRoomId) {
		webSocketSessionTracker.roomDisconnect(chatRoomId, userId);
		log.info("유저({})가 채팅방({})에서 나갔습니다.", userId, chatRoomId);

		return ResponseEntity.ok("채팅방에서 나갔습니다.");
	}
}
