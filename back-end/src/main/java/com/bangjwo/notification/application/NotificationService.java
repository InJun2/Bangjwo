package com.bangjwo.notification.application;

import com.bangjwo.notification.domain.entity.Notification;
import com.bangjwo.notification.domain.repository.NotificationRepository;
import com.bangjwo.notification.domain.vo.NotificationMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
	private final NotificationRepository notificationRepository;

	private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;
	private final Map<Long, SseEmitter> emitterMap = new ConcurrentHashMap<>();

	public SseEmitter subscribe(Long memberId) {
		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
		emitterMap.put(memberId, emitter);

		emitter.onCompletion(() -> emitterMap.remove(memberId));
		emitter.onTimeout(() -> emitterMap.remove(memberId));
		emitter.onError((e) -> emitterMap.remove(memberId));

		sendToClient(memberId, "connect", "EventStream Connected. [memberId=" + memberId + "]");

		return emitter;
	}

	@Async
	public void sendNotification(Long receiverId, NotificationMessage message) {
		saveAndSend(receiverId, message, message.getUrlTemplate());
	}

	@Async
	public void sendNotification(Long receiverId, NotificationMessage message, Long chatRoomId) {
		String finalUrl = message.formatUrl(chatRoomId);

		Optional<Notification> existingNoti = notificationRepository
			.findFirstByReceiverIdAndRelatedUrlOrderByCreatedAtDesc(receiverId, finalUrl);

		if (existingNoti.isPresent()) {
			Notification noti = existingNoti.get();
			noti.markAsUnread();
			noti.updateCreatedAt();
			notificationRepository.save(noti);

			broadcast(receiverId, message, finalUrl);
			return;
		}

		saveAndSend(receiverId, message, finalUrl);
	}
	
	private void broadcast(Long receiverId, NotificationMessage message, String finalUrl) {
		long unreadCount = notificationRepository.countByReceiverIdAndIsReadFalse(receiverId);
		String eventData = String.format("{\"message\":\"%s\", \"url\":\"%s\", \"unreadCount\":%d}",
			message.getMessage(), finalUrl, unreadCount);
		sendToClient(receiverId, message.getType().name(), eventData);
	}

	@Async
	public void sendNotification(Long receiverId, NotificationMessage message, Long roomId, Long contractId) {
		String formattedUrl = message.formatUrl(roomId, contractId);
		saveAndSend(receiverId, message, formattedUrl);
	}

	private void saveAndSend(Long receiverId, NotificationMessage message, String finalUrl) {
		Notification notification = Notification.builder()
			.receiverId(receiverId)
			.notificationType(message.getType())
			.message(message.getMessage())
			.relatedUrl(finalUrl)
			.build();
		notificationRepository.save(notification);

		long unreadCount = notificationRepository.countByReceiverIdAndIsReadFalse(receiverId);
		String eventData = String.format("{\"message\":\"%s\", \"url\":\"%s\", \"unreadCount\":%d}",
			message.getMessage(), finalUrl, unreadCount);

		sendToClient(receiverId, message.getType().name(), eventData);
	}

	private void sendToClient(Long memberId, String eventName, Object data) {
		SseEmitter emitter = emitterMap.get(memberId);
		if (emitter != null) {
			try {
				emitter.send(SseEmitter.event().name(eventName).data(data));
			} catch (IOException e) {
				emitterMap.remove(memberId);
				log.error("SSE 전송 오류 - memberId: {}", memberId, e);
			}
		}
	}

	public List<Notification> getUnreadNotifications(Long memberId) {
		return notificationRepository.findAllByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(memberId);
	}

	public void markAsRead(String notificationId) {
		notificationRepository.findById(notificationId).ifPresent(notification -> {
			notification.markAsRead();
			notificationRepository.save(notification);
		});
	}

	public void markAsReadByUrl(Long receiverId, String relatedUrl) {
		notificationRepository.findFirstByReceiverIdAndRelatedUrlOrderByCreatedAtDesc(receiverId, relatedUrl)
			.ifPresent(notification -> {
				notification.markAsRead();
				notificationRepository.save(notification);
				log.info("채팅방 입장으로 인한 알림 읽음 처리 완료 (URL: {})", relatedUrl);
			});
	}
}