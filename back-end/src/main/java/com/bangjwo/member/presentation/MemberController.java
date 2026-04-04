package com.bangjwo.member.presentation;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bangjwo.auth.resolver.MemberHeader;
import com.bangjwo.member.application.dto.request.UpdateMemberRequestDto;
import com.bangjwo.member.application.dto.response.MemberResponseDto;
import com.bangjwo.member.application.dto.response.MyContractListResponseDto;
import com.bangjwo.member.application.dto.response.ReviewListResponseDto;
import com.bangjwo.member.application.service.MemberService;
import com.bangjwo.portone.application.dto.IdentityDto;
import com.bangjwo.room.application.dto.response.RoomListResponseDto;
import com.bangjwo.room.application.service.RoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/member")
@RequiredArgsConstructor
@Tag(name = "Member", description = "회원 관련 API")
public class MemberController {
	private final MemberService memberService;
	private final RoomService roomService;

	@Operation(
		summary = "내 정보 조회",
		description = "JWT 토큰을 이용해 자신의 회원 정보를 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/me")
	public ResponseEntity<MemberResponseDto> getMember(@MemberHeader Long memberId) {
		var response = memberService.getMyInfo(memberId);

		return ResponseEntity.ok().body(response);
	}

	@Operation(
		summary = "내 회원 정보 수정",
		description = "내 회원 정보를 수정합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> updateMember(
		@MemberHeader Long memberId,
		@ModelAttribute UpdateMemberRequestDto requestDto) {
		memberService.updateMember(memberId, requestDto);

		return ResponseEntity.ok().build();
	}

	@Operation(
		summary = "내가 쓴 리뷰 목록 조회",
		description = "회원이 작성한 리뷰 목록을 페이지네이션 형태로 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/review")
	public ResponseEntity<ReviewListResponseDto> getMyReviewList(
		@MemberHeader Long memberId,
		@Parameter(description = "조회할 페이지 번호", example = "1") @RequestParam(required = false) Integer page,
		@Parameter(description = "페이지당 아이템 개수", example = "15") @RequestParam(required = false) Integer size) {
		var response = memberService.getMyReviewList(memberId, page, size);

		return ResponseEntity.ok().body(response);
	}

	@Operation(
		summary = "계약된 매물 목록 조회",
		description = "사용자가 계약한 매물(세입자/임대인)을 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/contract")
	public ResponseEntity<MyContractListResponseDto> getContractedRooms(
		@MemberHeader Long memberId,
		@RequestParam(required = false) Integer page,
		@RequestParam(required = false) Integer size
	) {
		var result = roomService.getContractedRooms(memberId, page, size);

		return ResponseEntity.ok(result);
	}

	@Operation(summary = "좋아요한 매물 목록 조회", description = "로그인된 사용자가 좋아요한 매물 목록을 조회합니다.",
		security = @SecurityRequirement(name = "JWT"))
	@ApiResponse(responseCode = "200", description = "정상적으로 좋아요한 매물 목록을 반환했습니다.")
	@GetMapping("/like")
	public ResponseEntity<RoomListResponseDto> getLikedRooms(
		@MemberHeader Long memberId,
		@RequestParam(required = false) Integer page,
		@RequestParam(required = false) Integer size) {
		var result = roomService.getLikeRooms(memberId, page, size);

		return ResponseEntity.ok(result);
	}

	@Operation(summary = "본인인증 정보 저장", description = "본인인증 ID를 입력으로 받고, 포트원 서버 조회를 통해 response 값인 이름, 생년월일, 전화번호를 사용자 정보에 저장합니다.",
		security = @SecurityRequirement(name = "JWT"))
	@ApiResponse(responseCode = "200", description = "정상적으로 사용자 정보에 등록되었습니다.")
	@PutMapping("/verify")
	public ResponseEntity<Void> setVerificationInformation(
		@MemberHeader Long userId,
		@RequestBody IdentityDto.IdentityRequest dto) {
		memberService.updateMemberForVerify(userId, dto);

		return ResponseEntity.ok().build();
	}

	@Operation(
		summary = "회원 탈퇴",
		description = "로그인된 사용자가 자신의 계정을 탈퇴(soft delete)합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponse(responseCode = "204", description = "정상적으로 탈퇴되었습니다.")
	@DeleteMapping("/me")
	public ResponseEntity<Void> withdrawMember(@MemberHeader Long memberId) {
		memberService.withdraw(memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "회원 본인 인증 여부 조회",
		description = "로그인된 사용자의 본인 인증 여부를 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponse(responseCode = "200", description = "유저의 본인 인증 여부를 반환합니다.")
	@GetMapping("/verify")
	public ResponseEntity<Boolean> checkMemberVerification(@MemberHeader Long memberId) {
		boolean isVerified = memberService.isVerified(memberId);

		return ResponseEntity.ok(isVerified);
	}
}
