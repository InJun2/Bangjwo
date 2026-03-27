package com.bangjwo.room.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.hibernate.annotations.SQLRestriction;

import com.bangjwo.global.common.entity.BaseEntity;
import com.bangjwo.room.application.dto.request.UpdateRoomRequestDto;
import com.bangjwo.room.domain.vo.RoomBuildingType;
import com.bangjwo.room.domain.vo.RoomDirection;
import com.bangjwo.room.domain.vo.RoomStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@SQLRestriction("deleted_at IS NULL")
@Table(indexes = {
	@Index(name = "idx_member_id", columnList = "memberId"),
	@Index(name = "idx_status", columnList = "status")
})
public class Room extends BaseEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long roomId;

	@Column(nullable = false)
	private Long memberId;

	@Column
	@Enumerated(EnumType.STRING)
	private RoomBuildingType buildingType;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private RoomStatus status;

	@Column(length = 20, nullable = false)
	private String realEstateId;

	@Column(nullable = false)
	private Integer deposit;

	@Column(nullable = false)
	private Integer monthlyRent;

	@Column(precision = 10, scale = 2)
	private BigDecimal exclusiveArea;

	@Column(precision = 10, scale = 2)
	private BigDecimal supplyArea;

	@Column
	private Integer totalUnits;

	@Column(length = 10)
	private String floor;

	@Column
	private Integer maxFloor;

	@Column(nullable = false)
	private Integer parkingSpaces;

	@Column(nullable = false)
	private LocalDate availableFrom;

	@Column(nullable = false)
	private LocalDate permissionDate;

	@Column
	private String simpleDescription;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(nullable = false)
	private Integer maintenanceCost;

	@Column(nullable = false)
	private Integer roomCnt;

	@Column(nullable = false)
	private Integer bathroomCnt;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private RoomDirection direction;

	@Column(nullable = false)
	private Boolean verified;

	@Column(nullable = false)
	private Boolean registryPaid;

	@Column(nullable = false)
	private Boolean discussable;

	@Column
	private String discussDetail;

	@Column(nullable = false)
	private Boolean reviewable;

	@Column(nullable = false)
	private Boolean isPhonePublic;

	// 양방향에 대해서는 일단 이후에 성능 측정 후 수정 여부 결정 예정

	/**
	 * PATCH 형태 업데이트 전용 메서드
	 * - UpdateRoomRequestDto의 null이 아닌 필드만 엔티티에 반영
	 */
	public void updateRoom(UpdateRoomRequestDto dto) {
		if (dto.getDeposit() != null) {
			this.deposit = dto.getDeposit();
		}

		if (dto.getMonthlyRent() != null) {
			this.monthlyRent = dto.getMonthlyRent();
		}

		if (dto.getExclusiveArea() != null) {
			this.exclusiveArea = dto.getExclusiveArea();
		}

		if (dto.getSupplyArea() != null) {
			this.supplyArea = dto.getSupplyArea();
		}

		if (dto.getTotalUnits() != null) {
			this.totalUnits = dto.getTotalUnits();
		}

		if (dto.getFloor() != null) {
			this.floor = dto.getFloor();
		}

		if (dto.getMaxFloor() != null) {
			this.maxFloor = dto.getMaxFloor();
		}

		if (dto.getParkingSpaces() != null) {
			this.parkingSpaces = dto.getParkingSpaces();
		}

		if (dto.getAvailableFrom() != null) {
			this.availableFrom = dto.getAvailableFrom();
		}

		if (dto.getPermissionDate() != null) {
			this.permissionDate = dto.getPermissionDate();
		}

		if (dto.getSimpleDescription() != null) {
			this.simpleDescription = dto.getSimpleDescription();
		}

		if (dto.getDescription() != null) {
			this.description = dto.getDescription();
		}

		if (dto.getMaintenanceCost() != null) {
			this.maintenanceCost = dto.getMaintenanceCost();
		}

		if (dto.getRoomCnt() != null) {
			this.roomCnt = dto.getRoomCnt();
		}

		if (dto.getBathroomCnt() != null) {
			this.bathroomCnt = dto.getBathroomCnt();
		}

		if (dto.getDirection() != null) {
			this.direction = dto.getDirection();
		}

		if (dto.getDiscussable() != null) {
			this.discussable = dto.getDiscussable();
		}

		if (dto.getDiscussDetail() != null) {
			this.discussDetail = dto.getDiscussDetail();
		}

		if (dto.getReviewable() != null) {
			this.reviewable = dto.getReviewable();
		}

		if (dto.getIsPhonePublic() != null) {
			this.isPhonePublic = dto.getIsPhonePublic();
		}
	}

	public void updateStatus(RoomStatus status) {
		this.status = status;
	}

	public void updateVerified() {
		this.verified = true;
	}

	public void updateRegistryPaid() {
		this.registryPaid = true;
	}
}

