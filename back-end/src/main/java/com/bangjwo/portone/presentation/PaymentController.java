package com.bangjwo.portone.presentation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bangjwo.auth.resolver.MemberHeader;
import com.bangjwo.portone.application.dto.PaymentDto;
import com.bangjwo.portone.application.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/payment")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Payment", description = "결제 관련 API")
public class PaymentController {

	private final PaymentService paymentService;

	@Operation(
		summary = "사전 정보 입력",
		description = "결제 전 아이엠포트에 사전등록 및 DB에 사용자의 결제 정보를 저장합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "사전 정보 저장 성공"),
			@ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
			@ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
		}
	)
	@PostMapping("/prepare")
	public ResponseEntity<Map<String, Object>> prepareOrder(
		@RequestBody PaymentDto.RequestDto dto) {    // 매물 + 회원 ID
		String merchantUid = "ORD" + System.currentTimeMillis();
		int amount = 10;

		paymentService.registerPaymentPrepare(merchantUid, amount);
		paymentService.prePayment(dto, merchantUid);

		Map<String, Object> response = new HashMap<>();
		response.put("merchant_uid", merchantUid);
		response.put("amount", amount);
		response.put("product_name", "등기부등본 조회");

		return ResponseEntity.ok(response);
	}

	@Operation(
		summary = "결제 검증",
		description = "포트원에 결제 내역을 검증을 요청하고 결제 내역을 DB에 저장합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "결제 검증 성공"),
			@ApiResponse(responseCode = "400", description = "해당 결제 내역 없음", content = @Content),
			@ApiResponse(responseCode = "500", description = "포트원 응답 오류", content = @Content)
		}
	)
	@PostMapping("/validation/{impUid}")
	public ResponseEntity<Long> validateIamPort(
		@PathVariable String impUid) {
		var paymentId = paymentService.validateIamport(impUid);

		return ResponseEntity.ok(paymentId);
	}

	@Operation(
		summary = "결제 상세 조회",
		description = "결제 상세 내역을 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "결제 조회 성공"),
			@ApiResponse(responseCode = "404", description = "결제 ID에 해당하는 내역 없음", content = @Content)
		}
	)
	@GetMapping("/result/{paymentId}")
	public ResponseEntity<PaymentDto.ResponseDto> getPayment(
		@PathVariable Long paymentId) {

		return ResponseEntity.ok().body(paymentService.getPaymentResult(paymentId));
	}

	@Operation(
		summary = "결제 목록 조회",
		description = "결제 목록을 조회합니다.",
		security = @SecurityRequirement(name = "JWT"),
		responses = {
			@ApiResponse(responseCode = "200", description = "결제 목록 조회 성공"),
			@ApiResponse(responseCode = "404", description = "해당 유저의 결제 내역 없음", content = @Content)
		}
	)
	@GetMapping("/results")
	public ResponseEntity<List<PaymentDto.ResponseDto>> getPayments(
		@MemberHeader Long userId) {

		return ResponseEntity.ok().body(paymentService.getPaymentResults(userId));
	}
}
