package com.bangjwo.room.application.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.global.common.error.room.RoomErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.global.common.image.FileUploaderPort;
import com.bangjwo.global.common.util.ImageUrlUtil;
import com.bangjwo.room.domain.entity.Image;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.repository.RoomImageRepository;
import com.bangjwo.room.domain.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomImageService {
	private final static String IMAGE_PATH = "rooms/";

	private final FileUploaderPort fileUploader;
	private final RoomImageRepository imageRepository;
	private final RoomRepository roomRepository;

	/**
	 * S3에 파일 업로드 후 생성된 이미지 URL을 이용해 Image 엔티티를 저장합니다.
	 *
	 * @param room 저장할 Room 엔티티
	 * @param file 업로드할 파일
	 */
	public void uploadAndSaveImage(Room room, MultipartFile file) {
		String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

		String imageUrl = fileUploader.upload(file, IMAGE_PATH, fileName);

		Room managedRoom = roomRepository.getReferenceById(room.getRoomId());

		Image image = Image.builder()
			.room(managedRoom)
			.imageUrl(ImageUrlUtil.getFullUrl(ImageUrlUtil.getFullUrl(imageUrl)))
			.build();

		imageRepository.save(image);
	}

	@Transactional
	public void uploadAndSaveImages(Room savedRoom, List<MultipartFile> images) {
		if (images != null) {
			for (MultipartFile file : images) {
				uploadAndSaveImage(savedRoom, file);
			}
		}
	}

	@Transactional
	public void updateImages(Room room, List<Long> deleteImageIds, List<MultipartFile> images) {
		if (deleteImageIds != null) {
			deleteImageIds.forEach(this::deleteById);
		}

		if (images != null) {
			uploadAndSaveImages(room, images);
		}
	}

	@Transactional
	public void deleteById(Long imageId) {
		imageRepository.deleteByImageId(imageId).orElseThrow(
			() -> new BusinessException(RoomErrorCode.NOT_FOUND_SEARCH_ROOM_IMAGE)
		);
	}

	@Transactional(readOnly = true)
	public List<Image> findByRoom(Room room) {
		return imageRepository.findAllByRoom(room);
	}

	@Transactional(readOnly = true)
	public List<Image> getMainImages(List<Long> roomIds) {
		return imageRepository.findMainImagesByRoomIds(roomIds);
	}
}
