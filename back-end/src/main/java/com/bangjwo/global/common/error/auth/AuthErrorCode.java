package com.bangjwo.global.common.error.auth;

import org.springframework.http.HttpStatus;

import com.bangjwo.global.common.error.ErrorCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum AuthErrorCode implements ErrorCode {
	NOT_EXIST_AUTHORIZATION_TOKEN(HttpStatus.FORBIDDEN, "AUTH4001", "로그인 정보가 없습니다."),
	INVALID_AUTHORIZATION_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH4002", "잘못된 인증 토큰 정보입니다."),
	MEMBER_JSON_SERIALIZE_FAIL(HttpStatus.SERVICE_UNAVAILABLE, "AUTH4003", "유저 정보 직렬화에 실패하였습니다"),
	INVALID_AUTH_CODE(HttpStatus.BAD_REQUEST, "AUTH4004", "redirectUrl에 유효한 인가 코드(code)가 없습니다."),
	KAKAO_TOKEN_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "AUTH5001", "카카오 토큰 요청에 실패하였습니다."),
	KAKAO_USER_INFO_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "AUTH5002", "카카오 유저 정보 요청에 실패하였습니다."),
	;

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}