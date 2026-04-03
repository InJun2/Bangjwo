package com.bangjwo.member.application.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.global.common.image.FileUploaderPort;
import com.bangjwo.global.common.util.ImageUrlUtil;
import com.bangjwo.member.domain.entity.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberImageService {

	private static final String IMAGE_PATH = "members/";
	private final FileUploaderPort fileUploader;

	/**
	 * 프로필 이미지 업로드 후 Member의 profileUrl을 업데이트합니다.
	 *
	 * @param file MultipartFile 형식의 이미지 파일
	 */
	@Transactional
	public void uploadAndUpdateProfileImage(Member member, MultipartFile file) {
		String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
		String imageUrl = fileUploader.upload(file, IMAGE_PATH, fileName);

		member.updateProfileUrl(ImageUrlUtil.getFullUrl(imageUrl));
	}
}

