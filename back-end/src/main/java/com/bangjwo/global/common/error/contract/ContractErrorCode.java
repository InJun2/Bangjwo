package com.bangjwo.global.common.error.contract;

import org.springframework.http.HttpStatus;

import com.bangjwo.global.common.error.ErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ContractErrorCode implements ErrorCode {
	INVALID_ROOM_STATUS_FOR_CONTRACT(HttpStatus.BAD_REQUEST, "CONTRACT4001", "계약을 생성할 수 없는 매물 상태입니다."),
	UNAUTHORIZED_LANDLORD_FOR_CONTRACT(HttpStatus.FORBIDDEN, "CONTRACT4002", "해당 매물에 대한 계약 생성 권한이 없습니다."),
	INVALID_LANDLORD_INFO_FOR_FINAL_SAVE(HttpStatus.BAD_REQUEST, "CONTRACT4003", "임대인 정보가 모두 입력되지 않았습니다."),
	INVALID_TENANT_INFO_FOR_FINAL_SAVE(HttpStatus.BAD_REQUEST, "CONTRACT4004",
		"임차인 정보가 모두 입력되지 않았습니다."),
	INVALID_LANDLORD_ACCESS(HttpStatus.FORBIDDEN, "CONTRACT4005", "해당 계약서의 임대인 정보 접근 권한이 없습니다."),
	INVALID_TENANT_ACCESS(HttpStatus.FORBIDDEN, "CONTRACT4006", "해당 계약서의 임차인 정보 접근 권한이 없습니다."),
	NOT_FOUND_LANDLORD_INFO(HttpStatus.NOT_FOUND, "CONTRACT4007", "해당 임대인 계약 정보가 존재하지 않습니다."),
	NOT_FOUND_CONTRACT(HttpStatus.NOT_FOUND, "CONTRACT4008", "해당 계약서가 존재하지 않습니다."),
	INVALID_CONTRACT_STATUS_FOR_LANDLORD_UPDATE(HttpStatus.FORBIDDEN, "CONTRACT4009", "현재 상태에서는 임대인 정보 수정이 불가능합니다."),
	INVALID_CONTRACT_STATUS_FOR_TENANT_UPDATE(HttpStatus.FORBIDDEN, "CONTRACT4010", "현재 상태에서는 임차인 정보 수정이 불가능합니다."),
	INVALID_CONTRACT_STATUS_FOR_LANDLORD_DRAFT(HttpStatus.FORBIDDEN, "CONTRACT4011", "임대인 임시 저장이 불가능한 상태입니다."),
	INVALID_CONTRACT_STATUS_FOR_TENANT_DRAFT(HttpStatus.FORBIDDEN, "CONTRACT4012", "임차인 임시 저장이 불가능한 상태입니다."),
	INVALID_CONTRACT_ACCESS(HttpStatus.FORBIDDEN, "CONTRACT4013", "해당 계약서 통합 정보를 접근할 권한이 없습니다"),
	INVALID_CONTRACT_STATUS_FOR_LANDLORD_SIGNATURE(HttpStatus.FORBIDDEN, "CONTRACT4014", "현재 상태에서는 임대인 서명이 불가능합니다."),
	INVALID_CONTRACT_STATUS_FOR_TENANT_SIGNATURE(HttpStatus.FORBIDDEN, "CONTRACT4015", "현재 상태에서는 임차인 서명이 불가능합니다."),
	INVALID_ROLE(HttpStatus.BAD_REQUEST, "CONTRACT4016", "유효하지 않은 계약 역할입니다."),
	NO_AUTH_TO_ACCESS_LANDLORD(HttpStatus.FORBIDDEN, "CONTRACT4017", "임대인 본인인증 권한이 없습니다."),
	NO_AUTH_TO_ACCESS_TENANT(HttpStatus.FORBIDDEN, "CONTRACT4018", "임차인 본인인증 권한이 없습니다."),
	CONTRACT_COMPLETION_FAILED(HttpStatus.BAD_GATEWAY, "CONTRACT4019", "계약서 블록체인 저장에 실패하였습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
