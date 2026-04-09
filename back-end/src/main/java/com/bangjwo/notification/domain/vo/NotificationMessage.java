package com.bangjwo.notification.domain.vo;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationMessage {

	CHAT_REQUEST(
		NotificationType.CHAT_REQUEST,
		"임차인의 문의 요청이 있습니다. 채팅 내용을 확인해주세요.",
		"/chat/%d"
	),
	LANDLORD_COMPLETED(
		NotificationType.CONTRACT_STATUS,
		"임대인이 계약서 작성을 완료했습니다. 내용을 확인해주세요.",
		"/buyer-contract/%d/%d"
	),
	TENANT_COMPLETED(
		NotificationType.CONTRACT_STATUS,
		"임차인이 계약서 확인을 완료했습니다. 임차인이 최종 승인까지 기다려주세요.",
		"/buyer-contract/%d/%d"
	),
	TENANT_SIGNED(
		NotificationType.CONTRACT_STATUS,
		"임차인이 서명을 완료했습니다. 최종 서명을 진행해주세요.",
		"/final-sign/%d/%d?role=LANDLORD"
	),
	CONTRACT_COMPLETED(
		NotificationType.CONTRACT_STATUS,
		"임대차 계약이 모두 완료되어 블록체인에 안전하게 저장되었습니다.",
		"/mypage/contract"
	);

	private final NotificationType type;
	private final String message;
	private final String urlTemplate;

	public String formatUrl(Object... args) {
		if (args != null && args.length > 0 && this.urlTemplate.contains("%d")) {
			return String.format(this.urlTemplate, args);
		}
		return this.urlTemplate;
	}
}
