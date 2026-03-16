package com.bangjwo.room.application.convert;

import java.util.List;
import java.util.stream.Collectors;

import com.bangjwo.member.domain.entity.Member;
import com.bangjwo.room.application.dto.request.CreateRoomRequestDto;
import com.bangjwo.room.application.dto.request.UpdateRoomMemoRequestDto;
import com.bangjwo.room.application.dto.response.ImageResponseDto;
import com.bangjwo.room.application.dto.response.IsRoomLikedResponseDto;
import com.bangjwo.room.application.dto.response.RoomSummaryResponse;
import com.bangjwo.room.application.dto.response.RoomVerificationStatusDto;
import com.bangjwo.room.application.dto.response.SearchDetailRoomResponseDto;
import com.bangjwo.room.application.dto.response.SearchRoomMemoResponseDto;
import com.bangjwo.room.domain.entity.Address;
import com.bangjwo.room.domain.entity.Image;
import com.bangjwo.room.domain.entity.Likes;
import com.bangjwo.room.domain.entity.MaintenanceInclude;
import com.bangjwo.room.domain.entity.Memo;
import com.bangjwo.room.domain.entity.Options;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.vo.MaintenanceIncludeName;
import com.bangjwo.room.domain.vo.RoomOption;
import com.bangjwo.room.domain.vo.RoomStatus;

import lombok.Builder;

public class RoomConverter {

	@Builder
	public static Room convert(CreateRoomRequestDto requestDto, Long memberId) {
		return Room.builder()
			.memberId(memberId)
			.buildingType(requestDto.getBuildingType())
			.status(RoomStatus.UNDER_VERIFICATION)
			.realEstateId(requestDto.getRealEstateId())
			.deposit(requestDto.getDeposit())
			.monthlyRent(requestDto.getMonthlyRent())
			.exclusiveArea(requestDto.getExclusiveArea())
			.supplyArea(requestDto.getSupplyArea())
			.totalUnits(requestDto.getTotalUnits())
			.floor(requestDto.getFloor())
			.maxFloor(requestDto.getMaxFloor())
			.parkingSpaces(requestDto.getParkingSpaces())
			.availableFrom(requestDto.getAvailableFrom())
			.permissionDate(requestDto.getPermissionDate())
			.simpleDescription(requestDto.getSimpleDescription())
			.description(requestDto.getDescription())
			.maintenanceCost(requestDto.getMaintenanceCost())
			.roomCnt(requestDto.getRoomCnt())
			.bathroomCnt(requestDto.getBathroomCnt())
			.direction(requestDto.getDirection())
			.discussable(requestDto.getDiscussable())
			.discussDetail(requestDto.getDiscussDetail())
			.reviewable(requestDto.getReviewable())
			.isPhonePublic(requestDto.getIsPhonePublic())
			// 기본값 설정
			.verified(false)
			.registryPaid(false)
			.build();
	}

	public static SearchDetailRoomResponseDto convert(Room room,
		Boolean isLiked,
		Address address,
		Member member,
		int reviewCnt,
		List<Options> options,
		List<MaintenanceInclude> maintenanceIncludes,
		List<Image> images) {

		List<RoomOption> optionList = options.stream()
			.map(Options::getOptionName)
			.collect(Collectors.toList());

		List<MaintenanceIncludeName> maintenanceIncludeList = maintenanceIncludes.stream()
			.map(MaintenanceInclude::getMaintenanceIncludeName)
			.collect(Collectors.toList());

		List<ImageResponseDto> imageDtoList = images.stream()
			.map(img -> ImageResponseDto.builder()
				.imageId(img.getImageId())
				.imageUrl(img.getImageUrl())
				.build())
			.collect(Collectors.toList());

		return SearchDetailRoomResponseDto.builder()
			.roomId(room.getRoomId())
			.memberId(room.getMemberId())
			.profileUrl(member.getProfileUrl())
			.isLiked(isLiked)
			.roomStatus(room.getStatus())
			.buildingType(room.getBuildingType())
			.realEstateId(room.getRealEstateId())
			.postalCode(address.getPostalCode())
			.address(address.getName())
			.addressDetail(address.getAddressDetail())
			.lat(address.getLat())
			.lng(address.getLng())
			.deposit(room.getDeposit())
			.monthlyRent(room.getMonthlyRent())
			.exclusiveArea(room.getExclusiveArea())
			.supplyArea(room.getSupplyArea())
			.totalUnits(room.getTotalUnits())
			.floor(room.getFloor())
			.maxFloor(room.getMaxFloor())
			.parkingSpaces(room.getParkingSpaces())
			.availableFrom(room.getAvailableFrom())
			.permissionDate(room.getPermissionDate())
			.simpleDescription(room.getSimpleDescription())
			.description(room.getDescription())
			.maintenanceCost(room.getMaintenanceCost())
			.roomCnt(room.getRoomCnt())
			.bathroomCnt(room.getBathroomCnt())
			.direction(room.getDirection())
			.discussable(room.getDiscussable())
			.discussDetail(room.getDiscussDetail())
			.reviewable(room.getReviewable())
			.isPhonePublic(room.getIsPhonePublic())
			.nickname(member.getNickname())
			.reviewCnts(reviewCnt)
			.phoneNumber(member.getPhone())
			.createDate(room.getCreatedAt())
			.updateDate(room.getUpdatedAt())

			// 변환된 리스트들
			.maintenanceIncludes(maintenanceIncludeList)
			.options(optionList)
			.images(imageDtoList)

			.build();
	}

	public static Memo convert(Room room, UpdateRoomMemoRequestDto requestDto, Long memberId) {
		return Memo.builder()
			.room(room)
			.memberId(memberId)
			.content(requestDto.getContent())
			.build();
	}

	public static SearchRoomMemoResponseDto convert(Memo memo) {
		return SearchRoomMemoResponseDto.builder()
			.roomId(memo.getRoom().getRoomId())
			.content(memo.getContent())
			.build();
	}

	public static Likes convertLike(Room room, Long memberId) {
		return Likes.builder()
			.room(room)
			.memberId(memberId)
			.flag(true)
			.build();
	}

	public static IsRoomLikedResponseDto convert(Likes roomLike) {
		return IsRoomLikedResponseDto.builder()
			.roomId(roomLike.getRoom().getRoomId())
			.isLiked(roomLike.getFlag())
			.build();
	}

	public static RoomSummaryResponse convertToRoomSummary(Room room, Boolean isLiked, String ImageUrl,
		Address address) {
		return RoomSummaryResponse.builder()
			.roomId(room.getRoomId())
			.memberId(room.getMemberId())
			.isLiked(isLiked)
			.buildingType(room.getBuildingType())
			.status(room.getStatus())
			.deposit(room.getDeposit())
			.monthlyRent(room.getMonthlyRent())
			.exclusiveArea(room.getExclusiveArea())
			.supplyArea(room.getSupplyArea())
			.maintenanceCost(room.getMaintenanceCost())
			.floor(room.getFloor())
			.simpleDescription(room.getSimpleDescription())
			.imageUrl(ImageUrl)
			.lat(address.getLat())
			.lng(address.getLng())
			.build();
	}

	public static RoomVerificationStatusDto convertSearchVerifyRoom(Room room) {
		return RoomVerificationStatusDto.builder()
			.verified(room.getVerified())
			.registryPaid(room.getRegistryPaid())
			.build();
	}
}
