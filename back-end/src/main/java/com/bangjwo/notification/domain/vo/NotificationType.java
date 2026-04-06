package com.bangjwo.notification.domain.vo;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "알림 유형", example = "CHAT_REQUEST", allowableValues = {"CHAT_REQUEST", "CONTRACT_STATUS"})
public enum NotificationType {
	@Schema(description = "채팅 요청 알림")
	CHAT_REQUEST,

	@Schema(description = "계약서 상태 변경 알림")
	CONTRACT_STATUS
}
