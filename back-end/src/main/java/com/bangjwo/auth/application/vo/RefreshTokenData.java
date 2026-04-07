package com.bangjwo.auth.application.vo;

import com.bangjwo.auth.application.dto.response.MemberAuthDto;

public record RefreshTokenData(
	String refreshToken,
	MemberAuthDto memberDto
) {
}
