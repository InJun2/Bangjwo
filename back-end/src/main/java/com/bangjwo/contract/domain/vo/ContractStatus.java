package com.bangjwo.contract.domain.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(
	description = "계약 상태",
	example = "LANDLORD_COMPLETED",
	allowableValues = {"BEFORE_WRITE", "LANDLORD_COMPLETED", "TENANT_COMPLETED", "TENANT_SIGNED", "COMPLETED"}
)
public enum ContractStatus {

	@Schema(description = "계약서 작성 전")
	BEFORE_WRITE("계약서 작성 전"),

	@Schema(description = "임대인 작성 완료")
	LANDLORD_COMPLETED("임대인 작성 완료"),

	@Schema(description = "임차인 작성 완료")
	TENANT_COMPLETED("임차인 작성 완료"),

	@Schema(description = "임차인 서명 완료")
	TENANT_SIGNED("임차인 서명 완료"),

	@Schema(description = "계약 완료")
	COMPLETED("계약 완료");

	private final String description;

	public boolean canLandlordFinalUpdate() {
		return this == BEFORE_WRITE || this == TENANT_COMPLETED || this == LANDLORD_COMPLETED;
	}

	public boolean canTenantFinalUpdate() {
		return this == LANDLORD_COMPLETED || this == TENANT_COMPLETED;
	}

	public boolean canLandlordDraft() {
		return this == BEFORE_WRITE;
	}

	public boolean canTenantDraft() {
		return this == LANDLORD_COMPLETED;
	}
}
