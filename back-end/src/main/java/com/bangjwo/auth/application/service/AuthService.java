package com.bangjwo.auth.application.service;

import org.springframework.stereotype.Service;

import com.bangjwo.auth.application.dto.KakaoAuthResponseDto;
import com.bangjwo.auth.application.dto.response.KakaoUserInfo;
import com.bangjwo.auth.application.dto.response.MemberAuthDto;
import com.bangjwo.auth.application.vo.RefreshTokenData;
import com.bangjwo.auth.infrastructure.JwtTokenProvider;
import com.bangjwo.auth.infrastructure.RefreshTokenStore;
import com.bangjwo.global.common.error.auth.AuthErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.member.application.service.MemberQueryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

	private final KakaoWebClientService kakaoWebClientService;
	private final JwtTokenProvider jwtTokenProvider;
	private final MemberQueryService memberQueryService;
	private final RefreshTokenStore refreshTokenStore;

	/**
	 * 카카오 인가 코드를 통해 사용자 정보를 조회하고,
	 * 회원 로그인 또는 회원가입 처리를 진행한 후,
	 * JWT 토큰을 발급하여 응답합니다.
	 */
	public KakaoAuthResponseDto loginWithKakao(String authCode) {
		KakaoUserInfo kakaoUserInfo = kakaoWebClientService.loginWithKakaoAuthCode(authCode);
		MemberAuthDto memberAuthDto = memberQueryService.loginOrSignupByKakao(kakaoUserInfo);

		String accessToken = jwtTokenProvider.createToken(memberAuthDto);
		String refreshToken = jwtTokenProvider.createRefreshToken(memberAuthDto.getMemberId());
		refreshTokenStore.saveToken(memberAuthDto.getMemberId(), refreshToken, memberAuthDto);

		return new KakaoAuthResponseDto(memberAuthDto.getLoginType(), accessToken, refreshToken);
	}

	/**
	 * 리프레시 토큰을 받아오고 기존 레디스에 저장된 리프레시 토큰을 삭제합니다.
	 * 이후 리프레스 토큰의 값으로 엑세스토큰과 리프레시 토큰을 생성하고 새로 생성된 리프레시 토큰을 레디스에 저장하고,
	 * 해당 값들을 반환합니다.
	 */
	public KakaoAuthResponseDto reissue(String oldRefreshToken) {
		jwtTokenProvider.validateRefreshToken(oldRefreshToken);
		Long memberId = Long.valueOf(jwtTokenProvider.getClaims(oldRefreshToken));
		RefreshTokenData tokenData = refreshTokenStore.getTokenData(memberId).orElse(null);

		if (tokenData == null || !tokenData.refreshToken().equals(oldRefreshToken)) {
			refreshTokenStore.removeToken(memberId);
			throw new BusinessException(AuthErrorCode.INVALID_AUTHORIZATION_REFRESH_TOKEN);
		}

		refreshTokenStore.removeToken(memberId);
		MemberAuthDto memberAuthDto = tokenData.memberDto();

		String newAccessToken = jwtTokenProvider.createToken(memberAuthDto);
		String newRefreshToken = jwtTokenProvider.createRefreshToken(memberAuthDto.getMemberId());

		refreshTokenStore.saveToken(memberId, newRefreshToken, memberAuthDto);

		return new KakaoAuthResponseDto(memberAuthDto.getLoginType(), newAccessToken, newRefreshToken);
	}

	/**
	 * 리프레시 토큰 삭제
	 */
	public void logout(String refreshToken) {
		if (refreshToken != null) {
			try {
				Long memberId = Long.valueOf(jwtTokenProvider.getClaims(refreshToken));
				refreshTokenStore.removeToken(memberId);
			} catch (Exception e) {
				throw new BusinessException(AuthErrorCode.INVALID_AUTHORIZATION_REFRESH_TOKEN);
			}
		}
	}
}
