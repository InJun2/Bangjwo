package com.bangjwo.auth.application.service;

import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import com.bangjwo.auth.application.dto.response.KakaoUserInfo;
import com.bangjwo.global.common.error.auth.AuthErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.global.config.kakao.KakaoConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoWebClientService {

	private static final String KAKAO_OAUTH_URL = "https://kauth.kakao.com/oauth/token";
	private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

	private final WebClient webClient;
	private final KakaoConfig kakaoConfig;

	public KakaoUserInfo loginWithKakaoAuthCode(String authCode) {
		String accessToken = requestAccessToken(authCode);

		return getKakaoUserInfo(accessToken);
	}

	private String requestAccessToken(String authCode) {
		try {
			MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
			formData.add("grant_type", "authorization_code");
			formData.add("client_id", kakaoConfig.getClientId());
			formData.add("redirect_uri", kakaoConfig.getRedirectUri());
			formData.add("code", authCode);

			Map<String, Object> tokenMap = webClient.post()
				.uri(KAKAO_OAUTH_URL)
				.contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.body(BodyInserters.fromFormData(formData))
				.retrieve()
				.onStatus(
					HttpStatusCode::isError,
					clientResponse -> clientResponse.bodyToMono(String.class)
						.flatMap(errorBody ->
							reactor.core.publisher.Mono.error(
								new BusinessException(AuthErrorCode.KAKAO_TOKEN_REQUEST_FAILED)
							)
						)
				)
				.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
				})
				.block();

			return (String)tokenMap.get("access_token");
		} catch (Exception e) {
			e.printStackTrace();
			throw new BusinessException(AuthErrorCode.KAKAO_TOKEN_REQUEST_FAILED);
		}
	}

	public KakaoUserInfo getKakaoUserInfo(String accessToken) {
		try {
			return webClient.get()
				.uri(KAKAO_USER_INFO_URL)
				.header("Authorization", "Bearer " + accessToken)
				.retrieve()
				.onStatus(
					HttpStatusCode::isError,
					clientResponse -> clientResponse.bodyToMono(String.class)
						.flatMap(errorBody -> {
							log.error("카카오 API 상세 에러 응답: {}", errorBody);
							return reactor.core.publisher.Mono.error(
								new BusinessException(AuthErrorCode.KAKAO_USER_INFO_REQUEST_FAILED)
							);
						})
				)
				.bodyToMono(KakaoUserInfo.class)
				.block();
		} catch (Exception e) {
			log.error("Kakao 유저 정보 파싱/통신 에러 상세: ", e);
			throw new BusinessException(AuthErrorCode.KAKAO_USER_INFO_REQUEST_FAILED);
		}
	}
}


