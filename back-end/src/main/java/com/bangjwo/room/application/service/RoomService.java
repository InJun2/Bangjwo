package com.bangjwo.room.application.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bangjwo.contract.domain.entity.Contract;
import com.bangjwo.contract.domain.repository.ContractRepository;
import com.bangjwo.global.common.error.room.RoomErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.global.common.exception.RoomException;
import com.bangjwo.global.common.page.PaginationRequest;
import com.bangjwo.global.common.util.VerificationUtil;
import com.bangjwo.member.application.dto.response.MyContractItemDto;
import com.bangjwo.member.application.dto.response.MyContractListResponseDto;
import com.bangjwo.member.application.service.MemberService;
import com.bangjwo.portone.application.service.VerificationService;
import com.bangjwo.room.application.convert.RoomConverter;
import com.bangjwo.room.application.dto.request.CreateRoomRequestDto;
import com.bangjwo.room.application.dto.request.UpdateRoomMemoRequestDto;
import com.bangjwo.room.application.dto.request.UpdateRoomRequestDto;
import com.bangjwo.room.application.dto.request.UpdateRoomStatusDto;
import com.bangjwo.room.application.dto.request.VerifyRoomRequestDto;
import com.bangjwo.room.application.dto.response.IsRoomLikedResponseDto;
import com.bangjwo.room.application.dto.response.RoomListResponseDto;
import com.bangjwo.room.application.dto.response.RoomVerificationStatusDto;
import com.bangjwo.room.application.dto.response.SearchDetailRoomResponseDto;
import com.bangjwo.room.application.dto.response.SearchRoomMemoResponseDto;
import com.bangjwo.room.domain.entity.Address;
import com.bangjwo.room.domain.entity.Image;
import com.bangjwo.room.domain.entity.Likes;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.repository.RoomRepository;
import com.bangjwo.room.domain.vo.RoomAreaType;
import com.bangjwo.room.domain.vo.RoomBuildingType;
import com.bangjwo.room.domain.vo.RoomStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {
	private final RoomRepository roomRepository;
	private final AddressService addressService;
	private final OptionService optionService;
	private final MaintenanceIncludeService maintenanceIncludeService;
	private final RoomImageService imageService;
	private final LikeService likeService;
	private final MemoService memoService;
	private final ReviewService reviewService;
	private final MemberService memberService;
	private final VerificationService verificationService;
	private final ContractRepository contractRepository;

	@Transactional
	public Long createRoom(CreateRoomRequestDto requestDto, Long memberId) {
		var savedRoom = roomRepository.save(RoomConverter.convert(requestDto, memberId));

		addressService.createAndSaveAddress(savedRoom, requestDto.getAddress(),
			requestDto.getAddressDetail(), requestDto.getPostalCode());
		optionService.saveOptions(savedRoom, requestDto.getOptions());
		maintenanceIncludeService.saveMaintenanceIncludes(savedRoom, requestDto.getMaintenanceIncludes());
		imageService.uploadAndSaveImages(savedRoom, requestDto.getImages());

		return savedRoom.getRoomId();
	}

	@Transactional
	public void updateRoom(Long roomId, UpdateRoomRequestDto requestDto, Long memberId) {
		var searchRoom = findRoom(roomId);
		validateRoomOwner(searchRoom, memberId, RoomErrorCode.NO_AUTH_TO_UPDATE_ROOM);

		searchRoom.updateRoom(requestDto);
		optionService.updateOptions(searchRoom, requestDto.getOptions());
		maintenanceIncludeService.updateMaintenanceIncludes(searchRoom, requestDto.getMaintenanceIncludes());
		imageService.updateImages(searchRoom, requestDto.getDeleteImageIds(), requestDto.getImages());
	}

	@Transactional
	public void deleteRoom(Long roomId, Long memberId) {
		var searchRoom = findRoom(roomId);
		validateRoomOwner(searchRoom, memberId, RoomErrorCode.NO_AUTH_TO_DELETE_ROOM);

		searchRoom.softDelete();
	}

	@Transactional(readOnly = true)
	public Room findRoom(Long roomId) {
		return roomRepository.findByRoomIdAndDeletedAtIsNull(roomId)
			.orElseThrow(() -> new RoomException(RoomErrorCode.NOT_FOUND_SEARCH_ROOM));
	}

	@Transactional(readOnly = true)
	public void validateRoomOwner(Room room, Long memberId, RoomErrorCode errorCode) {
		if (!room.getMemberId().equals(memberId)) {
			throw new BusinessException(errorCode);
		}
	}

	@Transactional(readOnly = true)
	public SearchDetailRoomResponseDto searchRoomDetail(Long roomId, Long memberId) {
		var room = findRoom(roomId);
		var address = addressService.findByRoom(room);
		var options = optionService.findByRoom(room);
		var maintenanceIncludes = maintenanceIncludeService.findByRoom(room);
		var images = imageService.findByRoom(room);
		var isLiked = false;
		if (memberId != null) {
			isLiked = likeService.getLike(room, memberId)
				.map(Likes::getFlag)
				.orElse(false);
		}

		int reviewCnt = reviewService.getReviews(room.getRealEstateId(), address.getAddressDetail()).size();
		var member = memberService.searchMember(room.getMemberId());

		return RoomConverter.convert(room, isLiked, address, member, reviewCnt, options, maintenanceIncludes, images);
	}

	@Transactional(readOnly = true)
	public SearchRoomMemoResponseDto searchRoomMemo(Long roomId, Long memberId) {
		var room = findRoom(roomId);

		return memoService.findByRoomAndMemberId(room, memberId)
			.map(RoomConverter::convert)
			.orElse(new SearchRoomMemoResponseDto(roomId, ""));    // 현재 생성된 메모가 없다면 빈 문자열 응답
	}

	@Transactional
	public void updateRoomMemo(Long roomId, UpdateRoomMemoRequestDto requestDto, Long memberId) {
		var room = findRoom(roomId);

		var memo = memoService.findByRoomAndMemberId(room, memberId);

		if (memo.isPresent()) {
			memo.get().updateContent(requestDto.getContent());
		} else {
			createRoomMemo(roomId, requestDto, memberId);
		}
	}

	@Transactional
	public void createRoomMemo(Long roomId, UpdateRoomMemoRequestDto requestDto, Long memberId) {
		var room = findRoom(roomId);

		memoService.saveMemo(RoomConverter.convert(room, requestDto, memberId));
	}

	@Transactional
	public void clearMemo(Long roomId, Long memberId) {
		var room = findRoom(roomId);

		memoService.findByRoomAndMemberId(room, memberId)
			.ifPresent(memo -> memo.updateContent(""));
	}

	@Transactional
	public IsRoomLikedResponseDto toggleLike(Long roomId, Long memberId) {
		var room = findRoom(roomId);

		// N + 1
		var roomLike = likeService.getLike(room, memberId)
			.map(like -> {
				like.toggleFlag();
				return like;
			})
			.orElseGet(() -> likeService.saveLike(RoomConverter.convertLike(room, memberId)));

		return RoomConverter.convert(roomLike);
	}

	@Transactional(readOnly = true)
	public RoomListResponseDto getMyListedRooms(Long memberId, Integer page, Integer size) {
		var pageable = PaginationRequest.toPageable(page, size);
		var roomPage = roomRepository.findAllByMemberId(memberId, pageable);
		var roomList = roomPage.getContent();
		var total = (int)roomPage.getTotalElements();

		return createRoomListResponseDto(roomList, total, pageable.getPageNumber(), pageable.getPageSize(), memberId);
	}

	@Transactional(readOnly = true)
	public RoomListResponseDto getLikeRooms(Long memberId, Integer page, Integer size) {
		var pageable = PaginationRequest.toPageable(page, size);
		var likePages = likeService.getAllLikes(memberId, pageable);
		int totalItems = (int)likePages.getTotalElements();

		var roomIds = likePages.getContent().stream()
			.map(like -> like.getRoom().getRoomId())
			.toList();
		var rooms = roomRepository.findByRoomIdIn(roomIds);

		return createRoomListResponseDto(rooms, totalItems, pageable.getPageNumber(), pageable.getPageSize(), memberId);
	}

	@Transactional(readOnly = true)
	public RoomListResponseDto searchRooms(Integer price, List<RoomAreaType> areaTypes, RoomBuildingType buildingType,
		BigDecimal centerLat, BigDecimal centerLng, Integer zoom, Integer page, Long memberId) {
		var spec = buildRoomSearchSpec(price, areaTypes, buildingType, centerLat, centerLng, zoom);
		var pageable = PaginationRequest.toPageable(page);

		var roomPages = roomRepository.findAll(spec, pageable);
		var rooms = roomPages.getContent();
		int total = (int)roomPages.getTotalElements();

		return createRoomListResponseDto(rooms, total, pageable.getPageNumber(), pageable.getPageSize(), memberId);
	}

	@Transactional(readOnly = true)
	public RoomListResponseDto createRoomListResponseDto(
		List<Room> rooms, int totalItems, int page, int size, Long memberId) {
		var roomIds = rooms.stream()
			.map(Room::getRoomId)
			.toList();

		var likes = likeService.getLikeRooms(rooms, memberId);
		var likeMap = likes.stream()
			.collect(Collectors.toMap(l -> l.getRoom().getRoomId(), Likes::getFlag, (a, b) -> a));

		var images = imageService.getMainImages(roomIds);
		var imageMap = images.stream()
			.collect(Collectors.toMap(i -> i.getRoom().getRoomId(), Image::getImageUrl, (a, b) -> a));

		var addresses = addressService.findByRoomIds(roomIds);
		var addressMap = addresses.stream()
			.collect(Collectors.toMap(addr -> addr.getRoom().getRoomId(), addr -> addr));

		var roomSummaryList = rooms.stream()
			.map(room -> {
				boolean liked = likeMap.getOrDefault(room.getRoomId(), false);
				String imageUrl = imageMap.getOrDefault(room.getRoomId(), null);
				Address address = addressMap.get(room.getRoomId());

				return RoomConverter.convertToRoomSummary(room, liked, imageUrl, address);
			})
			.toList();

		return new RoomListResponseDto(totalItems, page, size, roomSummaryList);
	}

	@Transactional(readOnly = true)
	public MyContractListResponseDto getContractedRooms(Long memberId, Integer page, Integer size) {
		var pageable = PaginationRequest.toPageable(page, size);
		var contracts = contractRepository.findByLandlordIdOrTenantId(memberId, memberId, pageable);

		List<Contract> validContracts = contracts.getContent().stream()
			.filter(contract -> contract.getRoom() != null && contract.getRoom().getDeletedAt() == null)
			.toList();

		List<Room> rooms = validContracts.stream()
			.map(Contract::getRoom)
			.toList();

		Map<Room, Address> addressMap = addressService.findByRoomIn(rooms).stream()
			.collect(Collectors.toMap(Address::getRoom, address -> address));

		List<MyContractItemDto> items = validContracts.stream()
			.map(contract -> {
				Address address = addressMap.get(contract.getRoom());
				return MyContractItemDto.of(contract, address, memberId);
			})
			.toList();
		int totalItems = (int) contracts.getTotalElements();

		return new MyContractListResponseDto(
			totalItems,
			pageable.getPageNumber() + 1,
			pageable.getPageSize(),
			items
		);
	}

	private Specification<Room> buildRoomSearchSpec(Integer price, List<RoomAreaType> areaTypes,
		RoomBuildingType buildingType, BigDecimal centerLat, BigDecimal centerLng, Integer zoom) {
		BigDecimal delta = calculateDeltaByZoom(zoom);
		BigDecimal minLat = centerLat.subtract(delta);
		BigDecimal maxLat = centerLat.add(delta);
		BigDecimal minLng = centerLng.subtract(delta);
		BigDecimal maxLng = centerLng.add(delta);

		Specification<Room> spec = Specification.where(null);

		if (price != null) {
			spec = spec.and(RoomSpecification.monthlyRentLessThanOrEqual(price));
		}
		spec = spec.and(RoomSpecification.exclusiveAreaIn(areaTypes));

		if (buildingType != null) {
			spec = spec.and(RoomSpecification.buildingTypeEquals(buildingType));
		}
		spec = spec.and(RoomSpecification.roomInAddressBounds(minLat, maxLat, minLng, maxLng));
		spec = spec.and(RoomSpecification.statusEquals(RoomStatus.ON_SALE));

		return spec;
	}

	private BigDecimal calculateDeltaByZoom(Integer zoom) {
		if (zoom == null) {
			zoom = 3;
		}

		return switch (zoom) {
			case 1 -> BigDecimal.valueOf(0.00061);
			case 2 -> BigDecimal.valueOf(0.00122);
			case 3 -> BigDecimal.valueOf(0.00245);
			case 4 -> BigDecimal.valueOf(0.00490);
			case 5 -> BigDecimal.valueOf(0.00980);
			case 6 -> BigDecimal.valueOf(0.01960);
			case 7 -> BigDecimal.valueOf(0.03920);
			case 8 -> BigDecimal.valueOf(0.07839);
			case 9 -> BigDecimal.valueOf(0.15679);
			case 10 -> BigDecimal.valueOf(0.31366);
			case 11 -> BigDecimal.valueOf(0.62721);
			case 12 -> BigDecimal.valueOf(1.25495);
			case 13 -> BigDecimal.valueOf(2.51151);
			case 14 -> BigDecimal.valueOf(5.03561);
			default -> BigDecimal.valueOf(0.00245);
		};
	}

	@Transactional
	public void updateRoomStatus(UpdateRoomStatusDto dto) {
		var room = findRoom(dto.getRoomId());
		room.updateStatus(dto.getStatus());
	}

	@Transactional
	public void verifyRoom(Long memberId, VerifyRoomRequestDto dto) {
		var room = findRoom(dto.getRoomId());
		validateRoomOwner(room, memberId, RoomErrorCode.NO_AUTH_TO_UPDATE_ROOM);

		var identity = verificationService.getVerification(dto.getIdentityVerificationId());
		var member = memberService.searchMember(memberId);
		VerificationUtil.compareMemberInfo(member, identity);
		room.updateVerified();
	}

	@Transactional
	public void publishRoom(Long roomId, Long memberId) {
		Room room = findRoom(roomId);

		if (!room.getMemberId().equals(memberId)) {
			throw new BusinessException(RoomErrorCode.NO_AUTH_TO_UPDATE_ROOM);
		}

		if (!RoomStatus.UNDER_VERIFICATION.equals(room.getStatus())) {
			throw new BusinessException(RoomErrorCode.INVALID_ROOM_STATUS);
		}

		if (Boolean.TRUE.equals(room.getVerified()) && Boolean.TRUE.equals(room.getRegistryPaid())) {
			room.updateStatus(RoomStatus.ON_SALE);
		} else {
			throw new BusinessException(RoomErrorCode.CONDITION_NOT_MET_FOR_ON_SALE);
		}
	}

	@Transactional(readOnly = true)
	public RoomVerificationStatusDto getRoomVerificationStatus(Long roomId, Long memberId) {
		var room = findRoom(roomId);

		if (!room.getMemberId().equals(memberId)) {
			throw new BusinessException(RoomErrorCode.NO_AUTH_TO_SEARCH_ROOM);
		}

		return RoomConverter.convertSearchVerifyRoom(room);
	}
}