package com.bangjwo.contract.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.contract.application.dto.request.LandlordSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.TenantSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.UpdateLandlordInfoDto;
import com.bangjwo.contract.domain.entity.LandlordInfo;
import com.bangjwo.contract.domain.entity.TenantInfo;
import com.bangjwo.global.common.image.FileUploaderPort;
import com.bangjwo.global.common.util.ImageUrlUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractImageService {
	private static final String LANDLORD_SIGNATURE_PATH = "landlord-signatures/";
	private static final String TENANT_SIGNATURE_PATH = "tenant-signatures/";

	private final FileUploaderPort fileUploader;

	private String generateFileName(MultipartFile file) {
		return System.currentTimeMillis() + "_" + file.getOriginalFilename();
	}

	/**
	 * 임대인 서명 이미지 업데이트 – ContractService에서 검증된 LandlordInfo 엔티티와 요청 DTO를 받아 S3에 업로드 후 엔티티를 수정합니다.
	 *
	 * @param dto 요청 DTO
	 * @param landlordInfo 이미 검증된 임대인 엔티티
	 */
	@Transactional
	public void updateLandlordSignatures(LandlordInfo landlordInfo,
		UpdateLandlordInfoDto dto) {
		if (dto.getLandlordSignatureUrl1() != null && !dto.getLandlordSignatureUrl1().isEmpty()) {
			String fileName = generateFileName(dto.getLandlordSignatureUrl1());
			String url = fileUploader.upload(dto.getLandlordSignatureUrl1(), LANDLORD_SIGNATURE_PATH, fileName);
			landlordInfo.setLandlordSignatureUrl1(ImageUrlUtil.getFullUrl(url));
		}

		if (dto.getLandlordSignatureUrl2() != null && !dto.getLandlordSignatureUrl2().isEmpty()) {
			String fileName = generateFileName(dto.getLandlordSignatureUrl2());
			String url = fileUploader.upload(dto.getLandlordSignatureUrl2(), LANDLORD_SIGNATURE_PATH, fileName);
			landlordInfo.setLandlordSignatureUrl2(ImageUrlUtil.getFullUrl(url));
		}

		if (dto.getLandlordSignatureUrl3() != null && !dto.getLandlordSignatureUrl3().isEmpty()) {
			String fileName = generateFileName(dto.getLandlordSignatureUrl3());
			String url = fileUploader.upload(dto.getLandlordSignatureUrl3(), LANDLORD_SIGNATURE_PATH, fileName);
			landlordInfo.setLandlordSignatureUrl3(ImageUrlUtil.getFullUrl(url));
		}
	}

	/**
	 * 임대인 최종 서명 이미지 업데이트 – ContractService에서 검증된 LandlordInfo 엔티티와 요청 DTO를 받아 S3에 업로드 후 엔티티를 수정합니다.
	 *
	 * @param dto 요청 DTO
	 * @param landlordInfo 이미 검증된 임대인 엔티티
	 */
	@Transactional
	public void updateLastLandlordSignatures(LandlordInfo landlordInfo,
		LandlordSignatureUpdateRequestDto dto) {
		if (dto.getSignature4() != null && !dto.getSignature4().isEmpty()) {
			String fileName = generateFileName(dto.getSignature4());
			String url = fileUploader.upload(dto.getSignature4(), LANDLORD_SIGNATURE_PATH, fileName);
			landlordInfo.setLandlordSignatureUrl4(ImageUrlUtil.getFullUrl(url));
		}
	}

	/**
	 * 임차인 최종 서명 이미지 업데이트 – ContractService에서 검증된 TenantInfo 엔티티와 요청 DTO를 받아 S3에 업로드 후 엔티티를 수정합니다.
	 *
	 * @param dto 요청 DTO
	 * @param tenantInfo 이미 검증된 임차인 엔티티
	 */
	@Transactional
	public void updateTenantSignature(TenantInfo tenantInfo,
		TenantSignatureUpdateRequestDto dto) {
		if (dto.getSignature() != null && !dto.getSignature().isEmpty()) {
			String fileName = generateFileName(dto.getSignature());
			String url = fileUploader.upload(dto.getSignature(), TENANT_SIGNATURE_PATH, fileName);
			tenantInfo.setTenantSignatureUrl(ImageUrlUtil.getFullUrl(url));
		}
	}
}
