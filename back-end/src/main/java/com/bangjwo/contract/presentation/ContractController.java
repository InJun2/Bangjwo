package com.bangjwo.contract.presentation;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bangjwo.auth.resolver.MemberHeader;
import com.bangjwo.contract.application.dto.request.CompleteDto;
import com.bangjwo.contract.application.dto.request.CreateContractRequestDto;
import com.bangjwo.contract.application.dto.request.LandlordSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.TenantSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.UpdateLandlordInfoDto;
import com.bangjwo.contract.application.dto.request.UpdateTenantInfoDto;
import com.bangjwo.contract.application.dto.request.VerifyContractMemberDto;
import com.bangjwo.contract.application.dto.response.ContractDetailResponseDto;
import com.bangjwo.contract.application.dto.response.ContractStatusResponseDto;
import com.bangjwo.contract.application.dto.response.ContractVerificationStatusDto;
import com.bangjwo.contract.application.dto.response.LandlordInfoResponseDto;
import com.bangjwo.contract.application.dto.response.TenantInfoResponseDto;
import com.bangjwo.contract.application.dto.validation.FinalSave;
import com.bangjwo.contract.application.dto.validation.TempSave;
import com.bangjwo.contract.application.service.ContractService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/contract")
@Tag(name = "Contract", description = "계약서 관련 API")
@RequiredArgsConstructor
public class ContractController {
	private final ContractService contractService;

	@Operation(
		summary = "계약서 생성",
		description = "방 ID를 기반으로 새로운 계약서를 생성합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "계약 생성 성공",
				content = @Content(schema = @Schema(implementation = Long.class))),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류", content = @Content),
			@ApiResponse(responseCode = "404", description = "해당 방을 찾을 수 없음", content = @Content)
		}
	)
	@PostMapping
	public ResponseEntity<Long> createContract(@RequestBody CreateContractRequestDto requestDto,
		@MemberHeader Long memberId) {
		Long contractId = contractService.createContract(requestDto, memberId);

		return ResponseEntity.ok(contractId);
	}

	@Operation(
		summary = "임대인 계약 정보 임시 저장",
		description = "입력된 정보만 계약서에 임시로 저장합니다. (모든 필드가 필수는 아님)",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "204", description = "임시 저장 성공"),
			@ApiResponse(responseCode = "400", description = "요청 데이터 오류", content = @Content),
			@ApiResponse(responseCode = "403", description = "임대인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임대인 정보 없음", content = @Content)
		}
	)
	@PatchMapping(value = "/landlord", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> draftLandlordInfo(
		@Validated(TempSave.class) @ModelAttribute UpdateLandlordInfoDto requestDto, @MemberHeader Long memberId) {
		contractService.draftLandlordInfo(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "임대인 계약 정보 최종 저장",
		description = "모든 필수 정보를 포함하여 계약서에 임대인 정보를 최종 저장합니다. 계약 상태가 BEFORE_WRITE 인 경우만 호출 가능합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "204", description = "최종 저장 성공"),
			@ApiResponse(responseCode = "400", description = "검증 실패 또는 데이터 누락", content = @Content),
			@ApiResponse(responseCode = "403", description = "임대인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임대인 정보 없음", content = @Content)
		}
	)
	@PatchMapping(value = "/landlord/final", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> finalLandlordInfo(
		@Validated(FinalSave.class) @ModelAttribute UpdateLandlordInfoDto requestDto, @MemberHeader Long memberId) {
		contractService.finalLandlordInfo(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "임차인 서명 전 임대인 수정",
		description = "임차인 서명 전에 계약 상태가 TENANT_COMPLETED인 경우 임대인이 수정할 수 있습니다. 이 경우 동시성 방지를 위해 락이 적용됩니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "204", description = "수정 성공"),
			@ApiResponse(responseCode = "400", description = "검증 실패 또는 데이터 누락", content = @Content),
			@ApiResponse(responseCode = "403", description = "임대인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임대인 정보 없음", content = @Content),
			@ApiResponse(responseCode = "409", description = "동시성 제어로 인한 요청 거부", content = @Content)
		}
	)
	@PatchMapping(value = "/landlord/final/after-tenant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> finalLandlordAfterTenant(
		@Validated(FinalSave.class) @ModelAttribute UpdateLandlordInfoDto requestDto,
		@MemberHeader Long memberId) {
		contractService.finalLandlordAfterTenant(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "임차인 계약 정보 임시 저장",
		description = "입력된 정보만 계약서에 임시 저장합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "204", description = "임시 저장 성공"),
			@ApiResponse(responseCode = "403", description = "임차인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임차인 정보 없음", content = @Content)
		}
	)
	@PatchMapping("/tenant")
	public ResponseEntity<Void> draftTenantInfo(
		@Validated(TempSave.class) @RequestBody UpdateTenantInfoDto requestDto,
		@MemberHeader Long memberId) {
		contractService.draftTenantInfo(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "임차인 계약 최종 저장 및 정보 수정",
		description = "필수 정보를 포함하여 계약서에 임차인 정보를 최종 저장합니다. 또는 최종 조회 이후 임차인이 서명하기 전 수정에서도 사용합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "204", description = "최종 저장 성공"),
			@ApiResponse(responseCode = "400", description = "검증 실패 또는 데이터 누락", content = @Content),
			@ApiResponse(responseCode = "403", description = "임차인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임차인 정보 없음", content = @Content)
		}
	)
	@PatchMapping("/tenant/final")
	public ResponseEntity<Void> finalTenantInfo(
		@Validated(FinalSave.class) @RequestBody UpdateTenantInfoDto requestDto,
		@MemberHeader Long memberId) {
		contractService.finalTenantInfo(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "계약서의 임대인 정보 조회",
		description = "계약 ID와 임대인 ID를 기반으로 해당 계약서에 저장된 임대인 정보를 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "조회 성공",
				content = @Content(schema = @Schema(implementation = LandlordInfoResponseDto.class))),
			@ApiResponse(responseCode = "403", description = "임대인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임대인 정보 없음", content = @Content)
		}
	)
	@GetMapping("/landlord")
	public ResponseEntity<LandlordInfoResponseDto> getLandlordInfo(
		@Parameter(description = "계약 ID", required = true) @RequestParam Long contractId,
		@MemberHeader Long landlordId) {
		LandlordInfoResponseDto dto = contractService.getLandlordInfo(contractId, landlordId);

		return ResponseEntity.ok(dto);
	}

	@Operation(
		summary = "계약서의 임차인 정보 조회",
		description = "계약 ID와 임차인 ID를 기반으로 해당 계약서에 저장된 임차인 정보를 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "조회 성공",
				content = @Content(schema = @Schema(implementation = TenantInfoResponseDto.class))),
			@ApiResponse(responseCode = "403", description = "임차인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 또는 임차인 정보 없음", content = @Content)
		}
	)
	@GetMapping("/tenant")
	public ResponseEntity<TenantInfoResponseDto> getTenantInfo(
		@Parameter(description = "계약 ID", required = true) @RequestParam Long contractId,
		@MemberHeader Long tenantId) {
		TenantInfoResponseDto dto = contractService.getTenantInfo(contractId, tenantId);

		return ResponseEntity.ok(dto);
	}

	@Operation(
		summary = "계약서 상태 조회",
		description = "계약 ID와 임대인 ID를 기반으로 계약 상태를 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "조회 성공",
				content = @Content(schema = @Schema(implementation = ContractStatusResponseDto.class))),
			@ApiResponse(responseCode = "403", description = "임대인 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 없음", content = @Content)
		}
	)
	@GetMapping("/status")
	public ResponseEntity<ContractStatusResponseDto> getContractStatus(
		@Parameter(description = "계약 ID", required = true) @RequestParam Long contractId,
		@MemberHeader Long memberId) {
		ContractStatusResponseDto dto = contractService.getContractStatus(contractId, memberId);

		return ResponseEntity.ok(dto);
	}

	@Operation(
		summary = "계약서 통합 정보 조회",
		description = "계약 ID와 사용자 ID(임대인 또는 임차인)를 통해 통합된 계약 정보를 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "조회 성공",
				content = @Content(schema = @Schema(implementation = ContractDetailResponseDto.class))),
			@ApiResponse(responseCode = "403", description = "해당 계약서 접근 권한 없음", content = @Content),
			@ApiResponse(responseCode = "404", description = "계약서 없음", content = @Content)
		}
	)
	@GetMapping("/detail")
	public ResponseEntity<ContractDetailResponseDto> getContractDetail(
		@Parameter(description = "계약 ID", required = true) @RequestParam Long contractId,
		@MemberHeader Long memberId) {
		ContractDetailResponseDto dto = contractService.getContractDetail(contractId, memberId);

		return ResponseEntity.ok(dto);
	}

	@Operation(
		summary = "임대인 서명 이미지 등록",
		description = "임차인 최종 조회 이후 임대인이 최종 조회 후 임대인 서명 이미지를 저장하여 계약을 완료합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@PatchMapping(value = "/landlord/signatures", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> uploadLandlordSignatures(
		@Valid @ModelAttribute LandlordSignatureUpdateRequestDto requestDto,
		@MemberHeader Long memberId) {
		contractService.updateLandlordSignatures(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "임차인 서명 이미지 등록",
		description = "임차인 최종 조회 이후 더 이상 계약서를 수정하지 않아도 괜찮다고 판단한다면 서명 이미지를 저장합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@PatchMapping(value = "/tenant/signature", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> uploadTenantSignature(
		@Valid @ModelAttribute TenantSignatureUpdateRequestDto requestDto,
		@MemberHeader Long memberId) {
		contractService.updateTenantSignature(requestDto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "계약 본인 인증",
		description = "임대인 또는 임차인의 본인 인증을 수행하고, 계약에 인증 여부를 저장합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@PatchMapping("/verify")
	public ResponseEntity<Void> verifyContractMember(
		@RequestBody @Valid VerifyContractMemberDto dto,
		@MemberHeader Long memberId
	) {
		contractService.verifyContractMember(dto, memberId);

		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "계약 확정",
		description = "작성한 계약서를 IPFS, 블록체인에 저장합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@PatchMapping(path = "/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Void> completeContract(@ModelAttribute CompleteDto completeDto,
		@MemberHeader Long memberId) {    // 유저 로그인 정보 추가 필요
		contractService.completeContract(completeDto, memberId);
		return ResponseEntity.noContent().build();
	}

	@Operation(
		summary = "계약서 조회",
		description = "저장된 계약서를 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@GetMapping("/{contractId}")
	public ResponseEntity<?> getContractDocs(@PathVariable Long contractId, @MemberHeader Long memberId) {
		byte[] pdf = contractService.getPdf(contractId, memberId);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_PDF);
		headers.setContentDisposition(ContentDisposition.builder("inline")
			.filename("contract.pdf")
			.build());

		return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
	}

	@Operation(
		summary = "계약서 본인 인증 여부 조회",
		description = "해당 계약서에 대해 임대인과 임차인의 본인 인증 여부를 조회합니다.",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponse(responseCode = "200", description = "계약서의 임대인/임차인 본인 인증 여부를 반환합니다.")
	@GetMapping("/{contractId}/verify")
	public ResponseEntity<ContractVerificationStatusDto> getContractVerificationStatus(
		@PathVariable Long contractId,
		@MemberHeader Long memberId) {
		ContractVerificationStatusDto status = contractService.getVerificationStatus(contractId, memberId);
		
		return ResponseEntity.ok(status);
	}
}
