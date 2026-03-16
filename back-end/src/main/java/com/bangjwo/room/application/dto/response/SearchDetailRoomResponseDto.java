package com.bangjwo.room.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.bangjwo.room.domain.vo.MaintenanceIncludeName;
import com.bangjwo.room.domain.vo.RoomBuildingType;
import com.bangjwo.room.domain.vo.RoomDirection;
import com.bangjwo.room.domain.vo.RoomOption;
import com.bangjwo.room.domain.vo.RoomStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@Schema(description = "매물 상세 조회 응답 DTO")
public class SearchDetailRoomResponseDto {

	@Schema(description = "매물(Room) ID", example = "1")
	private Long roomId;

	@Schema(description = "매물 등록자(회원) ID", example = "1")
	private Long memberId;

	@Schema(description = "좋아요 여부", example = "false")
	private Boolean isLiked;

	@Schema(
		description = "매물 상태 (집주인 인증 중, 판매 중, 판매 완료)",
		example = "ON_SALE",
		allowableValues = {"UNDER_VERIFICATION", "ON_SALE", "SOLD_OUT"}
	)
	private RoomStatus roomStatus;

	@Schema(
		description = "건물 유형 (원룸/투룸, 아파트, 빌라/주택, 오피스텔)",
		example = "APARTMENT",
		allowableValues = {"ONEROOM_TWOROOM", "APARTMENT", "VILLA_HOUSE", "OFFICETEL"}
	)
	private RoomBuildingType buildingType;

	@Schema(description = "매물 등록자 Image", nullable = true)
	private String profileUrl;

	@Schema(description = "부동산 고유 번호", example = "1146-1996-006588")
	private String realEstateId;

	@Schema(description = "우편번호", example = "06220")
	private String postalCode;

	@Schema(description = "주소 명", example = "서울특별시 강남구 테헤란로 212 (역삼동)")
	private String address;

	@Schema(description = "상세 주소", example = "101동 202호")
	private String addressDetail;

	@Schema(description = "위도(위치정보)", example = "37.5665")
	private BigDecimal lat;

	@Schema(description = "경도(위치정보)", example = "126.9780")
	private BigDecimal lng;

	@Schema(description = "보증금", example = "10000000")
	private Integer deposit;

	@Schema(description = "월세", example = "500000")
	private Integer monthlyRent;

	@Schema(description = "전용면적", example = "300.12")
	private BigDecimal exclusiveArea;

	@Schema(description = "공급면적", example = "400.50")
	private BigDecimal supplyArea;

	@Schema(description = "세대수", example = "80")
	private Integer totalUnits;

	@Schema(description = "층수(문자열)", example = "5층 or 반지하 or 지하1층")
	private String floor;

	@Schema(description = "최고 층수", example = "20")
	private Integer maxFloor;

	@Schema(description = "주차 가능 대수", example = "100")
	private Integer parkingSpaces;

	@Schema(description = "입주 가능일", example = "2025-04-01")
	private LocalDate availableFrom;

	@Schema(description = "사용 승인일", example = "2024-12-31")
	private LocalDate permissionDate;

	@Schema(description = "간단한 매물 설명", example = "역세권, 풀옵션")
	private String simpleDescription;

	@Schema(description = "매물 상세 설명", example = "지하철 5분 거리, 1층 편의점 연결이 가능하고 SSAFY 가기가 편합니다.")
	private String description;

	@Schema(description = "관리비", example = "50000")
	private Integer maintenanceCost;

	@Schema(description = "방 개수", example = "1")
	private Integer roomCnt;

	@Schema(description = "화장실 개수", example = "1")
	private Integer bathroomCnt;

	@Schema(
		description = "방 향 (동향, 서향, 남향, 북향, 북서향, 북동향, 남서향, 남동향)",
		example = "SOUTH",
		allowableValues = {"EAST", "WEST", "SOUTH", "NORTH", "NORTHWEST", "NORTHEAST", "SOUTHWEST", "SOUTHEAST"}
	)
	private RoomDirection direction;

	@Schema(description = "협의 가능 여부", example = "true")
	private Boolean discussable;

	@Schema(description = "협의 상세 정보", example = "보증금 조정 가능")
	private String discussDetail;

	@Schema(description = "리뷰 작성 가능 여부", example = "true")
	private Boolean reviewable;

	@Schema(description = "전화번호 공개 여부", example = "false")
	private Boolean isPhonePublic;

	@Schema(description = "리뷰 갯수", example = "2")
	private int reviewCnts;

	@Schema(description = "닉네임", example = "방줘방줘")
	private String nickname;

	@Schema(description = "생성 일자", example = "2025-04-01")
	private LocalDateTime createDate;

	@Schema(description = "수정 일자", example = "2025-04-01")
	private LocalDateTime updateDate;

	@Schema(description = "전화번호", example = "010-1234-1234")
	private String phoneNumber;

	@Schema(
		description = "관리비 포함 항목 리스트 (수도료, 전기료, 인터넷비, 가스비, 청소비, 유선 TV, 주차비, 난방비, 승강기 유지비)",
		example = "[\"INTERNET\", \"GAS\"]",
		allowableValues = {
			"WATER", "ELECTRICITY", "INTERNET", "GAS", "CLEANING",
			"CABLE_TV", "PARKING", "HEATING", "ELEVATOR_MAINTENANCE"
		}
	)
	private List<MaintenanceIncludeName> maintenanceIncludes;

	@Schema(
		description = "매물 옵션 리스트 (엘리베이터, 옥탑, 에어컨, 세탁기, 냉장고, 전자렌지, 가스렌지, 인덕션, 침대)",
		example = "[\"BED\", \"AIR_CONDITIONER\"]",
		allowableValues = {
			"ELEVATOR", "ROOFTOP", "AIR_CONDITIONER", "WASHING_MACHINE",
			"REFRIGERATOR", "MICROWAVE", "GAS_RANGE", "INDUCTION", "BED"
		}
	)
	private List<RoomOption> options;

	@Schema(description = "매물 이미지 리스트")
	private List<ImageResponseDto> images;
}
