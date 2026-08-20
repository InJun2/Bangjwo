package com.bangjwo.room.application.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.room.domain.vo.MaintenanceIncludeName;
import com.bangjwo.room.domain.vo.RoomBuildingType;
import com.bangjwo.room.domain.vo.RoomDirection;
import com.bangjwo.room.domain.vo.RoomOption;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "새로운 매물(Room) 생성 요청 DTO")
public class CreateRoomRequestDto {
	@Schema(
		description = "건물 유형 (예: 원룸/투룸, 아파트, 빌라/주택, 오피스텔)",
		example = "APARTMENT",
		allowableValues = {"ONEROOM_TWOROOM", "APARTMENT", "VILLA_HOUSE", "OFFICETEL"}
	)
	@NotNull
	private RoomBuildingType buildingType;

	@Schema(description = "부동산 고유 번호", example = "1146-1996-006588", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private String realEstateId;

	@Schema(description = "우편번호", example = "06220", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private String postalCode;

	@Schema(description = "주소 명", example = "서울특별시 강남구 테헤란로 212 (역삼동)", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private String address;

	@Schema(description = "상세 주소", example = "101동 202호", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
	@NotNull
	private String addressDetail;

	@Schema(description = "보증금", example = "10000000", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "0")
	@NotNull
	@Min(0)
	private Integer deposit;

	@Schema(description = "월세", example = "500000", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "0")
	@NotNull
	@Min(0)
	private Integer monthlyRent;

	@Schema(description = "전용면적", example = "300.12", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	@Min(0)
	private BigDecimal exclusiveArea;

	@Schema(description = "공급면적", example = "400.50", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
	@NotNull
	@Min(0)
	private BigDecimal supplyArea;

	@Schema(description = "세대수", example = "80", minimum = "0")
	@Min(0)
	private Integer totalUnits;

	@Schema(description = "층수(문자열)", example = "5층/반지하", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotBlank
	private String floor;

	@Schema(description = "최고 층수", example = "20", requiredMode = Schema.RequiredMode.AUTO, minimum = "0")
	@NotNull
	@Min(0)
	private Integer maxFloor;

	@Schema(description = "주차 가능 대수", example = "100", requiredMode = Schema.RequiredMode.AUTO, minimum = "0")
	@NotNull
	@Min(0)
	private Integer parkingSpaces;

	@Schema(description = "입주 가능일", example = "2025-04-01", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private LocalDate availableFrom;

	@Schema(description = "사용 승인일", example = "2024-12-31", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private LocalDate permissionDate;

	@Schema(description = "간단한 매물 설명", example = "역세권, 풀옵션")
	private String simpleDescription;

	@Schema(description = "매물 상세 설명", example = "지하철 5분 거리, 1층 편의점 연결이 가능하고 SSAFY 가기가 편합니다.")
	private String description;

	@Schema(description = "관리비", example = "50000", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "0")
	@NotNull
	@Min(0)
	private Integer maintenanceCost;

	@Schema(description = "방 개수", example = "1", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "1")
	@NotNull
	@Min(1)
	private Integer roomCnt;

	@Schema(description = "화장실 개수", example = "1", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "0")
	@NotNull
	@Min(0)
	private Integer bathroomCnt;

	@Schema(
		description = "방 향 (예: 동향, 서향, 남향, 북향 등)",
		example = "SOUTH",
		allowableValues = {"EAST", "WEST", "SOUTH", "NORTH", "NORTHWEST", "NORTHEAST", "SOUTHWEST", "SOUTHEAST"}
	)
	@NotNull
	private RoomDirection direction;

	@Schema(description = "협의 가능 여부", example = "true")
	private Boolean discussable;

	@Schema(description = "협의 상세 정보", example = "보증금 조정 가능")
	@NotNull
	private String discussDetail;

	@Schema(description = "리뷰 작성 가능 여부", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private Boolean reviewable;

	@Schema(description = "전화번호 공개 여부", example = "false", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	private Boolean isPhonePublic;

	@Schema(
		description = "관리비 포함 항목 리스트 (예: 수도료, 전기료, 인터넷비, 가스비 등)",
		example = "[\"INTERNET\", \"GAS\"]",
		allowableValues = {
			"WATER", "ELECTRICITY", "INTERNET", "GAS", "CLEANING",
			"CABLE_TV", "PARKING", "HEATING", "ELEVATOR_MAINTENANCE"
		}
	)
	private List<MaintenanceIncludeName> maintenanceIncludes;

	@Schema(
		description = "매물 옵션 리스트 (예: 침대, 에어컨, 세탁기 등)",
		example = "[\"BED\", \"AIR_CONDITIONER\"]",
		allowableValues = {
			"ELEVATOR", "ROOFTOP", "AIR_CONDITIONER", "WASHING_MACHINE",
			"REFRIGERATOR", "MICROWAVE", "GAS_RANGE", "INDUCTION", "BED"
		}
	)
	private List<RoomOption> options;

	@Schema(description = "매물 이미지 파일 리스트(최소 3개 이상 등록)", requiredMode = Schema.RequiredMode.REQUIRED)
	@NotNull
	@Size(min = 3, message = "이미지는 최소 3개 이상 등록해야 합니다.")
	private List<MultipartFile> images;
}
