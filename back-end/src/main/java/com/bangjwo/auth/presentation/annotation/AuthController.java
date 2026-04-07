package com.bangjwo.auth.presentation.annotation;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bangjwo.auth.application.dto.KakaoAuthResponseDto;
import com.bangjwo.auth.application.service.AuthService;
import com.bangjwo.global.common.util.CookieUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "소셜 로그인 API")
public class AuthController {

	private final AuthService authService;

	@Value("${token.refresh_expiration_time}")
	private Long refreshExpirationTime;

	@Operation(
		summary = "카카오 로그인",
		description = "프론트에서 받은 Kakao OAuth 인가 코드를 통해 백엔드에서 토큰 요청 및 사용자 정보를 반환합니다.",
		requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
			required = true,
			description = "Kakao 인가 코드",
			content = @Content(
				mediaType = "application/json",
				schema = @Schema(example = "{ \"code\": \"kakao_authorization_code_here\" }")
			)
		)
	)
	@PostMapping("/login")
	public ResponseEntity<KakaoAuthResponseDto> login(@RequestBody Map<String, String> body,
		HttpServletResponse response) {
		String authCode = body.get("code");
		KakaoAuthResponseDto authResult = authService.loginWithKakao(authCode);
		CookieUtil.addCookie(response, "refreshToken", authResult.refreshToken(),
			changeExpirationTime(refreshExpirationTime));

		return ResponseEntity.ok(authResult);
	}

	@Operation(
		summary = "토큰 재발급 (RTR)",
		description = "쿠키의 Refresh Token을 읽어 새로운 Access Token과 Refresh Token을 발급합니다."
	)
	@PostMapping("/reissue")
	public ResponseEntity<KakaoAuthResponseDto> reissue(
		@CookieValue(value = "refreshToken", required = false) String refreshToken,
		HttpServletResponse response) {
		KakaoAuthResponseDto authResult = authService.reissue(refreshToken);
		CookieUtil.addCookie(response, "refreshToken", authResult.refreshToken(),
			changeExpirationTime(refreshExpirationTime));

		return ResponseEntity.ok(authResult);
	}

	@Operation(
		summary = "로그아웃",
		description = "Redis에 저장된 Refresh Token을 삭제하고 프론트엔드의 쿠키를 비웁니다."
	)
	@PostMapping("/logout")
	public ResponseEntity<Void> logout(
		@CookieValue(value = "refreshToken", required = false) String refreshToken,
		HttpServletResponse response) {
		authService.logout(refreshToken);
		CookieUtil.deleteRefreshToken(response);

		return ResponseEntity.ok().build();
	}

	private int changeExpirationTime(Long refreshTokenMsTime) {
		return (int)(refreshTokenMsTime / 1000);
	}
}
