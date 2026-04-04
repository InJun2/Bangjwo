package com.bangjwo.room.application.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bangjwo.global.common.error.room.RoomErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.room.domain.entity.Address;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.repository.AddressRepository;
import com.bangjwo.room.domain.vo.KakaoAddressInfo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressService {
	private final KakaoAddressService kakaoAddressService;
	private final AddressRepository addressRepository;

	/**
	 * 도로명 주소를 이용하여 카카오 주소 정보를 조회한 후, 해당 정보를 이용하여 Address 엔티티를 생성하고 저장합니다.
	 *
	 * @param roadAddress 도로명 주소 (예: "서울특별시 강남구 테헤란로 123")
	 * @param room       새로 생성한 Room
	 */
	@Transactional
	public void createAndSaveAddress(Room room, String roadAddress, String addressDetail, String postalCode) {
		KakaoAddressInfo info = kakaoAddressService.fetchAddressInfoByRoadName(roadAddress);

		Address address = Address.builder()
			.room(room)
			.name(roadAddress)
			.addressDetail(addressDetail)
			.postalCode(postalCode)
			.lat(info.lat())
			.lng(info.lng())
			.province(info.region1depthName())
			.city(info.region2depthName())
			.district(info.region3depthName())
			.build();

		addressRepository.save(address);
	}

	@Transactional(readOnly = true)
	public Address findByRoom(Room room) {
		return addressRepository.findByRoom(room)
			.orElseThrow(() -> new BusinessException(RoomErrorCode.NOT_FOUND_SEARCH_ROOM_ADDRESS));
	}

	public List<Address> findByRoomIds(List<Long> roomIds) {
		return addressRepository.findByRoomRoomIdIn(roomIds);
	}

	public List<Address> findByRoomIn(List<Room> rooms) {
		return addressRepository.findByRoomIn(rooms);
	}
}
