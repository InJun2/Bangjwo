package com.bangjwo.portone.application.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.bangjwo.global.common.error.portone.PortoneErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class PortoneWebClientService {

	private static final String PORTONE_API_BASE_URL = "https://api.iamport.kr";

	private final WebClient webClient;

	@Value("${imp.key}")
	private String apiKey;

	@Value("${imp.secret.pay}")
	private String apiSecret;

	/**
	 * 포트원 결제 단건 조회 (테스트 결제 포함)
	 */
	public JsonNode getPaymentDetail(String impUid) {
		String accessToken = requestAccessToken();

		try {
			JsonNode rootNode = webClient.get()
				.uri(PORTONE_API_BASE_URL + "/payments/{impUid}?include_sandbox=true", impUid)
				.header("Authorization", accessToken)
				.retrieve()
				.onStatus(
					HttpStatusCode::isError,
					clientResponse -> clientResponse.bodyToMono(String.class)
						.flatMap(errorBody -> {
							log.error("포트원 조회 실패 응답: {}", errorBody);
							return reactor.core.publisher.Mono.error(
								new BusinessException(PortoneErrorCode.IMP_UID_NOT_FOUND)
							);
						})
				)
				.bodyToMono(JsonNode.class)
				.block();

			if (rootNode == null || rootNode.path("code").asInt() != 0) {
				log.error("포트원 에러 메시지: {}", rootNode != null ? rootNode.path("message").asText() : "응답 없음");
				throw new BusinessException(PortoneErrorCode.IMP_UID_NOT_FOUND);
			}

			return rootNode.path("response");

		} catch (BusinessException e) {
			throw e;
		} catch (Exception e) {
			log.error("포트원 결제 단건 조회 중 통신 예외 발생", e);
			throw new BusinessException(PortoneErrorCode.IMP_UID_NOT_FOUND);
		}
	}

	/**
	 * 포트원 V1 Access Token 발급 (내부 호출용)
	 */
	private String requestAccessToken() {
		try {
			Map<String, String> body = Map.of(
				"imp_key", apiKey,
				"imp_secret", apiSecret
			);

			Map<String, Object> tokenMap = webClient.post()
				.uri(PORTONE_API_BASE_URL + "/users/getToken")
				.contentType(MediaType.APPLICATION_JSON)
				.bodyValue(body)
				.retrieve()
				.onStatus(
					HttpStatusCode::isError,
					clientResponse -> clientResponse.bodyToMono(String.class)
						.flatMap(errorBody -> {
							log.error("포트원 토큰 발급 실패: {}", errorBody);
							return reactor.core.publisher.Mono.error(
								new BusinessException(PortoneErrorCode.PAYMENT_INTERNAL_ERROR)
							);
						})
				)
				.bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
				})
				.block();

			@SuppressWarnings("unchecked")
			Map<String, String> response = (Map<String, String>)tokenMap.get("response");
			return response.get("access_token");

		} catch (Exception e) {
			log.error("포트원 토큰 요청 중 예외 발생", e);
			throw new BusinessException(PortoneErrorCode.PAYMENT_INTERNAL_ERROR);
		}
	}
}