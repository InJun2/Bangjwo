package com.bangjwo.auth.infrastructure;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.bangjwo.auth.application.vo.RefreshTokenData;
import com.bangjwo.global.common.error.GlobalErrorCodes;
import com.bangjwo.global.common.error.auth.AuthErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.auth.application.dto.response.MemberAuthDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenStore {
	private static final String REDIS_PREFIX = "bangjwo_refresh:";

	private final StringRedisTemplate redisTemplate;
	private final ObjectMapper objectMapper;

	@Value("${token.refresh_expiration_time}")
	private Long refreshExpirationTime;

	public void saveToken(Long memberId, String refreshToken, MemberAuthDto memberDto) {
		try {
			RefreshTokenData data = new RefreshTokenData(refreshToken, memberDto);
			String json = objectMapper.writeValueAsString(data);
			redisTemplate.opsForValue()
				.set(REDIS_PREFIX + memberId, json, refreshExpirationTime, TimeUnit.MILLISECONDS);
		} catch (JsonProcessingException e) {
			throw new BusinessException(AuthErrorCode.MEMBER_JSON_SERIALIZE_FAIL);
		} catch (RedisConnectionFailureException e) {
			throw new BusinessException(GlobalErrorCodes.INTERNAL_SERVER_ERROR);
		}
	}

	public Optional<RefreshTokenData> getTokenData(Long memberId) {
		try {
			String json = redisTemplate.opsForValue().get(REDIS_PREFIX + memberId);
			if (json == null) {
				return Optional.empty();
			}
			return Optional.of(objectMapper.readValue(json, RefreshTokenData.class));
		} catch (Exception e) {
			throw new BusinessException(AuthErrorCode.MEMBER_JSON_SERIALIZE_FAIL);
		}
	}

	public void removeToken(Long memberId) {
		redisTemplate.delete(REDIS_PREFIX + memberId);
	}
}