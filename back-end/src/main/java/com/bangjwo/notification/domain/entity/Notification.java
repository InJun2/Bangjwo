package com.bangjwo.notification.domain.entity;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

import com.bangjwo.notification.domain.vo.NotificationType;

@Getter
@Builder
@Document(collection = "notifications")
public class Notification {

	@Id
	private String id;

	private Long receiverId;
	private NotificationType notificationType;
	private String message;
	private String relatedUrl;

	@Builder.Default
	private boolean isRead = false;

	@CreatedDate
	private LocalDateTime createdAt;

	public void markAsRead() {
		this.isRead = true;
	}
}