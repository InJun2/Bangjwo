package com.bangjwo.member.application.dto.response;

import java.math.BigDecimal;

import com.bangjwo.contract.domain.entity.Contract;
import com.bangjwo.contract.domain.vo.ContractRole;
import com.bangjwo.contract.domain.vo.ContractStatus;
import com.bangjwo.room.domain.entity.Address;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.vo.RoomBuildingType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "내 계약 목록 조회 시 필요한 최소한의 매물 및 계약 정보를 담는 DTO")
public class MyContractItemDto {
	@Schema(description = "매물 ID", example = "1")
	private Long roomId;

	@Schema(description = "매물 등록자 ID", example = "1")
	private Long memberId;

	@Schema(description = "건물 유형", example = "원룸/투룸")
	private RoomBuildingType buildingType;

	@Schema(description = "보증금", example = "1000")
	private Integer deposit;

	@Schema(description = "월세", example = "50")
	private Integer monthlyRent;

	@Schema(description = "위도")
	private BigDecimal lat;

	@Schema(description = "경도")
	private BigDecimal lng;

	@Schema(description = "계약서 ID", example = "1")
	private Long contractId;

	@Schema(description = "계약 상태", example = "BEFORE_WRITE")
	private ContractStatus contractStatus;

	@Schema(description = "나의 역할 (LANDLORD / TENANT)", example = "TENANT")
	private ContractRole myRole;

	public static MyContractItemDto of(Contract contract, Address address, Long requestMemberId) {
		Room room = contract.getRoom();
		ContractRole myRole = contract.getLandlordId().equals(requestMemberId) ? ContractRole.LANDLORD : ContractRole.TENANT;

		return MyContractItemDto.builder()
			.roomId(room.getRoomId())
			.memberId(room.getMemberId())
			.buildingType(room.getBuildingType())
			.deposit(room.getDeposit())
			.monthlyRent(room.getMonthlyRent())
			.lat(address.getLat())
			.lng(address.getLng())
			.contractId(contract.getContractId())
			.contractStatus(contract.getContractStatus())
			.myRole(myRole)
			.build();
	}
}