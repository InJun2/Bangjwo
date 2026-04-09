package com.bangjwo.contract.application.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.contract.application.dto.validation.FinalSave;
import com.bangjwo.contract.application.validation.NotEmptyMultipartFile;
import com.bangjwo.contract.domain.vo.MonthlyRentType;
import com.bangjwo.room.domain.vo.ContractType;
import com.bangjwo.room.domain.vo.LeaseType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "임대인 계약 정보 업데이트 요청 DTO (임시저장 또는 최종 저장용)")
public class UpdateLandlordInfoDto {

	@Schema(description = "수정하는 계약서 ID", example = "1")
	@NotNull
	@Min(1)
	private Long contractId;

	@Schema(
		description = "임대 유형 (MONTHLY_WITH_DEPOSIT: 보증금 있는 월세, PURE_MONTHLY: 월세)",
		example = "MONTHLY_WITH_DEPOSIT",
		allowableValues = {
			"MONTHLY_WITH_DEPOSIT",
			"PURE_MONTHLY"
		}
	)
	@NotNull(groups = FinalSave.class)
	private LeaseType leaseType;

	@Schema(description = "임대 부동산 주소 (소재지)", example = "서울특별시 강남구 역삼동 123-45 강남아파트")
	@NotNull(groups = FinalSave.class)
	private String rentalPropertyAddress;

	@Schema(description = "임대 부분 상세 주소", example = "강남아파트 5동 502호")
	@NotNull(groups = FinalSave.class)
	private String rentalPartAddress;

	@Schema(description = "토지 지목", example = "대지")
	@NotNull(groups = FinalSave.class)
	private String rentalHousingLandType;

	@Schema(description = "토지 면적", example = "120.00")
	@NotNull(groups = FinalSave.class)
	private BigDecimal rentalHousingLandArea;

	@Schema(description = "건물 구조", example = "철근콘크리트")
	@NotNull(groups = FinalSave.class)
	private String propertyStructure;

	@Schema(description = "건물 용도", example = "공동주택")
	@NotNull(groups = FinalSave.class)
	private String propertyPurpose;

	@Schema(description = "건물 면적", example = "85.50")
	@NotNull(groups = FinalSave.class)
	private BigDecimal propertyArea;

	@Schema(description = "임차할 부분 상세 주소 (동, 층, 호)", example = "5동 5층 502호")
	private String rentalPartDetailAddress;

	@Schema(description = "임대 부분 면적", example = "25.00")
	@NotNull(groups = FinalSave.class)
	private BigDecimal rentalPartArea;

	@Schema(
		description = "계약 유형 (NEW: 신규 계약, RENEW_BY_AGREEMENT: 합의에 의한 재계약, EXTENSION: 갱신계약)",
		example = "NEW",
		allowableValues = {
			"NEW",
			"RENEW_BY_AGREEMENT",
			"EXTENSION"
		})
	@NotNull(groups = FinalSave.class)
	private ContractType contractType;

	@Schema(description = "갱신 전 임대차 계약 시작일", example = "2023-04-01")
	private LocalDate previousLeaseStartDate;

	@Schema(description = "갱신 전 임대차 계약 종료일", example = "2025-03-31")
	private LocalDate previousLeaseEndDate;

	@Schema(description = "갱신 전 보증금", example = "30000000")
	private Long previousDepositAmount;

	@Schema(description = "갱신 전 차임(월세)", example = "1200000")
	private Long previousMonthlyRent;

	@Schema(description = "체납 여부", example = "false")
	@NotNull(groups = FinalSave.class)
	private Boolean taxArrears;

	@Schema(description = "우선 확정 일자 여부", example = "false")
	@NotNull(groups = FinalSave.class)
	private Boolean priorityConfirmedDateYn;

	@Schema(description = "보증금", example = "50000000")
	@NotNull(groups = FinalSave.class)
	private Long depositAmount;

	@Schema(description = "계약금", example = "5000000")
	@NotNull(groups = FinalSave.class)
	private Integer contractFee;

	@Schema(description = "중도금", example = "2000000")
	@NotNull(groups = FinalSave.class)
	private Integer middleFee;

	@Schema(description = "중도금 지급일", example = "2025-04-15")
	private LocalDate interimPaymentDate;

	@Schema(description = "잔금", example = "10000000")
	@NotNull(groups = FinalSave.class)
	private Integer balance;

	@Schema(description = "잔금 지급일", example = "2025-05-01")
	private LocalDate balancePaymentDate;

	@Schema(description = "차임(월세)", example = "1500000")
	@NotNull(groups = FinalSave.class)
	private Long monthlyRent;

	@Schema(description = "월세 지급일 (일)", example = "15")
	@NotNull(groups = FinalSave.class)
	private String monthlyRentPaymentDate;

	@Schema(
		description = "월세 선불/후불 여부",
		example = "PREPAID",
		allowableValues = {"PREPAID", "POSTPAID"
		})
	@NotNull(groups = FinalSave.class)
	private MonthlyRentType monthlyRentType;

	@Schema(description = "월세 입금 은행", example = "국민은행")
	@NotNull(groups = FinalSave.class)
	private String monthlyRentAccountBank;

	@Schema(description = "월세 입금 계좌번호", example = "123-456-7890")
	@NotNull(groups = FinalSave.class)
	private String monthlyRentAccountNumber;

	@Schema(description = "고정 관리비", example = "500000")
	@NotNull(groups = FinalSave.class)
	private Integer fixedManagementFee;

	@Schema(description = "고정 관리비가 아닌 경우", example = "여름에는 2만원 추가로 더 받습니다.")
	@NotNull(groups = FinalSave.class)
	private String unfixedManagementFee;

	@Schema(description = "임대 시작일", example = "2025-04-01")
	@NotNull(groups = FinalSave.class)
	private LocalDate leaseStartDate;

	@Schema(description = "임대 종료일", example = "2035-03-31")
	@NotNull(groups = FinalSave.class)
	private LocalDate leaseEndDate;

	@Schema(description = "시설 수리 필요 여부", example = "true")
	@NotNull(groups = FinalSave.class)
	private Boolean facilitiesRepairStatus;

	@Schema(description = "시설 수리 필요 시 내용", example = "전기, 수도 수리")
	@NotNull(groups = FinalSave.class)
	private String facilitiesRepairContent;

	@Schema(description = "수리 완료 시기 - 잔금 지급 기일", example = "2025-04-30")
	private LocalDate repairCompletionByBalanceDate;

	@Schema(description = "수리 완료 시기 - 기타", example = "입주 전까지 완료 예정")
	private String repairCompletionEtc;

	@Schema(description = "미수리 시 잔금 지급 기일", example = "2025-05-05")
	private LocalDate notRepairedByBalanceDate;

	@Schema(description = "미수리 시 기타", example = "수리 완료 전까지 전세금 일부 유보")
	private String notRepairedEtc;

	@Schema(description = "임대인 부담 사항", example = "관리비 일부")
	@NotNull(groups = FinalSave.class)
	private String landlordBurden;

	@Schema(description = "임차인 부담 사항", example = "임대료")
	@NotNull(groups = FinalSave.class)
	private String tenantBurden;

	@Schema(description = "전입 신고 일자", example = "2025-05-01")
	@NotNull(groups = FinalSave.class)
	private LocalDate moveInRegistrationDate;

	@Schema(description = "계약 해제 체납 초과 한계", example = "200000")
	@NotNull(groups = FinalSave.class)
	private Integer unpaidAmount;

	@Schema(description = "분쟁 조정위원회 소정 여부", example = "true")
	@NotNull(groups = FinalSave.class)
	private Boolean disputeResolution;

	@Schema(description = "주택 철거 및 재건축 계획 여부", example = "false")
	@NotNull(groups = FinalSave.class)
	private Boolean isHousingReconstructionPlanned;

	@Schema(description = "철거 및 재건축 시 공사 시기", example = "2030-01-01")
	private LocalDate constructionPeriod;

	@Schema(description = "철거 및 재건축 시 소요 기간 (개월)", example = "12")
	private Integer estimatedConstructionDuration;

	@Schema(description = "상세 주소 제공 동의 여부", example = "true")
	@NotNull(groups = FinalSave.class)
	private Boolean isDetailedAddressConsentGiven;

	@Schema(description = "기타 특약 사항 리스트", example = "[\"현 상태 유지 조건\", \"애완동물 금지\"]")
	private List<String> etc;

	@Schema(description = "계약서 작성일", example = "2025-03-20")
	@NotNull(groups = FinalSave.class)
	private LocalDate contractWrittenDate;

	@Schema(description = "임대인 주소", example = "서울특별시 강남구 역삼동 123-45")
	@NotNull(groups = FinalSave.class)
	private String address;

	@Schema(description = "암호화된 임대인 주민등록번호", example = "123456-1234567")
	@NotNull(groups = FinalSave.class)
	private String residentRegistrationNumber;

	@Schema(description = "임대인 전화번호", example = "010-1234-5678")
	@NotNull(groups = FinalSave.class)
	private String phoneNumber;

	@Schema(description = "임대인 이름", example = "홍길동")
	@NotNull(groups = FinalSave.class)
	private String name;

	@Schema(description = "미납 국세,지방세 없음 동의 서명 URL", format = "binary", example = "data:image/png...")
	@NotEmptyMultipartFile(groups = FinalSave.class)
	private MultipartFile landlordSignatureUrl1;

	@Schema(description = "선순위 확정일자 현황 해당 없음 서명 URL", format = "binary", example = "data:image/png...")
	@NotEmptyMultipartFile(groups = FinalSave.class)
	private MultipartFile landlordSignatureUrl2;

	@Schema(description = "계약내용 영수자 서명 URL", format = "binary", example = "data:image/png...")
	@NotEmptyMultipartFile(groups = FinalSave.class)
	private MultipartFile landlordSignatureUrl3;
}
