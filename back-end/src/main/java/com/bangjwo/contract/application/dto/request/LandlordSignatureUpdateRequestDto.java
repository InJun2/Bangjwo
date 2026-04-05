package com.bangjwo.contract.application.dto.request;

import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.contract.application.validation.NotEmptyMultipartFile;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "임대인 서명 이미지 업로드 요청 DTO")
public class LandlordSignatureUpdateRequestDto {

	@Schema(description = "계약 ID", example = "1")
	@NotNull
	private Long contractId;

	@Schema(description = "최종 서명", type = "string", format = "binary")
	@NotEmptyMultipartFile
	private MultipartFile signature4;

	@NotNull(message = "최종 계약서 PDF 파일은 필수입니다.")
	private MultipartFile pdfFile;
}
