package com.bangjwo.member.application.service;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.bangjwo.auth.application.dto.response.KakaoUserInfo;
import com.bangjwo.auth.application.dto.response.MemberAuthDto;
import com.bangjwo.auth.domain.vo.LoginType;
import com.bangjwo.global.common.error.member.MemberErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.member.application.convert.MemberConverter;
import com.bangjwo.member.domain.entity.Member;
import com.bangjwo.member.domain.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberQueryServiceImpl implements MemberQueryService {
	private final MemberRepository memberRepository;

	@Override
	public MemberAuthDto loginOrSignupByKakao(KakaoUserInfo kakaoUserInfo) {
		Long kakaoId = Long.valueOf(kakaoUserInfo.getKakaoId());

		return memberRepository.findByKakaoId(kakaoId)
			.map(member -> MemberConverter.toMemberAuthDto(member, LoginType.LOGIN))
			.orElseGet(() -> {
				try {
					Member newMember = memberRepository.save(MemberConverter.convert(kakaoUserInfo));

					return MemberConverter.toMemberAuthDto(newMember, LoginType.SIGNUP);
				} catch (DataIntegrityViolationException e) {
					Member existingMember = memberRepository.findByKakaoId(kakaoId)
						.orElseThrow(() -> new BusinessException(MemberErrorCode.DUPLICATED_MEMBER));

					return MemberConverter.toMemberAuthDto(existingMember, LoginType.LOGIN);
				}
			});
	}
}
