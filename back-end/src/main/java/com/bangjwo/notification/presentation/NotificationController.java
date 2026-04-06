package com.bangjwo.notification.presentation;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.bangjwo.auth.resolver.MemberHeader;
import com.bangjwo.notification.application.NotificationService;
import com.bangjwo.notification.domain.entity.Notification;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
	private final NotificationService notificationService;

	@GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public ResponseEntity<SseEmitter> subscribe(@MemberHeader Long memberId) {
		SseEmitter emitter = notificationService.subscribe(memberId);
		return ResponseEntity.ok()
			.header("X-Accel-Buffering", "no")
			.header("Cache-Control", "no-cache")
			.body(emitter);
	}

	@GetMapping("/unread")
	public ResponseEntity<List<Notification>> getUnreadNotifications(@MemberHeader Long memberId) {
		return ResponseEntity.ok(notificationService.getUnreadNotifications(memberId));
	}

	@PatchMapping("/{notificationId}/read")
	public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
		notificationService.markAsRead(notificationId);
		return ResponseEntity.ok().build();
	}
}