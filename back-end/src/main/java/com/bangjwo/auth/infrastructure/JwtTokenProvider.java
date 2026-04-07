package com.bangjwo.auth.infrastructure;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.bangjwo.auth.application.dto.response.MemberAuthDto;
import com.bangjwo.global.common.error.auth.AuthErrorCode;
import com.bangjwo.global.common.exception.BusinessException;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
	@Value("${token.secret}")
	private String secretKey;

	@Value("${token.access_expiration_time}")
	private Long tokenExpiry;

	@Value("${token.refresh_expiration_time}")
	private Long refreshTokenExpiry;

	public String createToken(MemberAuthDto memberDto) {
		return Jwts.builder()
			.setSubject(String.valueOf(memberDto.getMemberId()))
			.claim("nickname", memberDto.getNickName())
			.setIssuedAt(new Date())
			.setExpiration(new Date(System.currentTimeMillis() + tokenExpiry))
			.signWith(SignatureAlgorithm.HS256, secretKey)
			.compact();
	}

	public String createRefreshToken(Long memberId) {
		return Jwts.builder()
			.setSubject(String.valueOf(memberId))
			.setIssuedAt(new Date())
			.setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiry))
			.signWith(SignatureAlgorithm.HS256, secretKey)
			.compact();
	}

	public void validateRefreshToken(String token) {
		try {
			if (token == null) {
				throw new BusinessException(AuthErrorCode.INVALID_AUTHORIZATION_REFRESH_TOKEN);
			}

			Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
		} catch (JwtException e) {
			throw new BusinessException(AuthErrorCode.INVALID_AUTHORIZATION_TOKEN);
		}
	}

	public String getClaims(String token) {
		try {
			return Jwts.parserBuilder()
				.setSigningKey(secretKey)
				.build()
				.parseClaimsJws(token)
				.getBody()
				.getSubject();
		} catch (JwtException e) {
			log.error("jwt parsing fail;: {} : ", e.getLocalizedMessage());
			throw new BusinessException(AuthErrorCode.INVALID_AUTHORIZATION_TOKEN);
		}
	}
}