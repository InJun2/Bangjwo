package com.bangjwo.contract.application.service;

import java.math.BigInteger;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bangjwo.blockchain.application.service.BlockchainService;
import com.bangjwo.common.crypto.AESService;
import com.bangjwo.common.crypto.RSAService;
import com.bangjwo.contract.application.convert.ContractConverter;
import com.bangjwo.contract.application.convert.ContractDetailConverter;
import com.bangjwo.contract.application.convert.LandlordInfoConverter;
import com.bangjwo.contract.application.convert.SpecialClauseConverter;
import com.bangjwo.contract.application.convert.TenantInfoConverter;
import com.bangjwo.contract.application.dto.request.CompleteDto;
import com.bangjwo.contract.application.dto.request.CreateContractRequestDto;
import com.bangjwo.contract.application.dto.request.LandlordSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.TenantSignatureUpdateRequestDto;
import com.bangjwo.contract.application.dto.request.UpdateLandlordInfoDto;
import com.bangjwo.contract.application.dto.request.UpdateTenantInfoDto;
import com.bangjwo.contract.application.dto.request.VerifyContractMemberDto;
import com.bangjwo.contract.application.dto.response.ContractDetailResponseDto;
import com.bangjwo.contract.application.dto.response.ContractStatusResponseDto;
import com.bangjwo.contract.application.dto.response.ContractVerificationStatusDto;
import com.bangjwo.contract.application.dto.response.LandlordInfoResponseDto;
import com.bangjwo.contract.application.dto.response.TenantInfoResponseDto;
import com.bangjwo.contract.domain.entity.Contract;
import com.bangjwo.contract.domain.entity.LandlordInfo;
import com.bangjwo.contract.domain.entity.SpecialClause;
import com.bangjwo.contract.domain.entity.TenantInfo;
import com.bangjwo.contract.domain.repository.ContractRepository;
import com.bangjwo.contract.domain.vo.ContractRole;
import com.bangjwo.contract.domain.vo.ContractStatus;
import com.bangjwo.global.common.error.RedisLockErrorCode;
import com.bangjwo.global.common.error.blockchain.BlockchainErrorCode;
import com.bangjwo.global.common.error.contract.ContractErrorCode;
import com.bangjwo.global.common.exception.BusinessException;
import com.bangjwo.global.common.exception.RoomException;
import com.bangjwo.global.common.lock.RedisLock;
import com.bangjwo.global.common.util.VerificationUtil;
import com.bangjwo.member.application.service.MemberService;
import com.bangjwo.member.domain.entity.Member;
import com.bangjwo.portone.application.dto.IdentityDto;
import com.bangjwo.portone.application.service.VerificationService;
import com.bangjwo.room.application.service.RoomService;
import com.bangjwo.room.domain.entity.Room;
import com.bangjwo.room.domain.vo.RoomStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {
	private final RoomService roomService;
	private final MemberService memberService;
	private final ContractImageService contractImageService;
	private final ContractRepository contractRepository;
	private final VerificationService verificationService;
	private final AESService aesService;
	private final RSAService rsaService;
	private final PinataStorageService pinataStorageService;
	private final BlockchainService blockchainService;

	@Transactional
	public Contract validateLandlordDraftContract(Long contractId, Long landlordId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getLandlordId())
			.filter(id -> id.equals(landlordId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_LANDLORD_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(ContractStatus::canLandlordDraft)
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_LANDLORD_DRAFT));
		return contract;
	}

	@Transactional
	public Contract validateLandlordFinalContract(Long contractId, Long landlordId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getLandlordId())
			.filter(id -> id.equals(landlordId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_LANDLORD_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(ContractStatus::canLandlordFinalUpdate)
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_LANDLORD_UPDATE));
		return contract;
	}

	@Transactional
	public Contract validateTenantDraftContract(Long contractId, Long tenantId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getTenantId())
			.filter(id -> id.equals(tenantId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_TENANT_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(ContractStatus::canTenantDraft)
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_TENANT_DRAFT));
		return contract;
	}

	@Transactional
	public Contract validateTenantFinalContract(Long contractId, Long tenantId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getTenantId())
			.filter(id -> id.equals(tenantId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_TENANT_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(ContractStatus::canTenantFinalUpdate)
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_TENANT_UPDATE));
		return contract;
	}

	@Transactional
	public Long createContract(CreateContractRequestDto requestDto, Long memberId) {
		Optional<Contract> existingContract = contractRepository.findByRoom_RoomId(requestDto.getRoomId());

		if (existingContract.isPresent()) {
			return existingContract.get().getContractId();
		}

		Room room = roomService.findRoom(requestDto.getRoomId());
		Contract contract = ContractConverter.convert(room, requestDto, memberId);
		Contract saved = contractRepository.save(contract);
		return saved.getContractId();
	}

	@Transactional
	public void draftLandlordInfo(UpdateLandlordInfoDto requestDto, Long memberId) {
		Contract contract = validateLandlordDraftContract(requestDto.getContractId(), memberId);
		LandlordInfo landlordInfo = contract.getLandlordInfo();
		SpecialClause specialClause = contract.getSpecialClause();
		LandlordInfoConverter.updateDraft(landlordInfo, requestDto);
		SpecialClauseConverter.updateDraft(specialClause, requestDto);
		contractImageService.updateLandlordSignatures(landlordInfo, requestDto);
	}

	@Transactional
	public void finalLandlordInfo(UpdateLandlordInfoDto requestDto, Long memberId) {
		Contract contract = validateLandlordFinalContract(requestDto.getContractId(), memberId);

		updateContractInfo(contract, requestDto);
	}

	@Transactional
	@RedisLock(key = "'contract:' + #requestDto.contractId", errorCode = RedisLockErrorCode.TENANT_IN_PROGRESS)
	public void finalLandlordAfterTenant(UpdateTenantInfoDto requestDto, Long memberId) {
		Contract contract = validateLandlordFinalContract(requestDto.getContractId(), memberId);

		TenantInfoConverter.updateFinal(contract.getTenantInfo(), requestDto);
		contract.updateContractStatus(ContractStatus.TENANT_COMPLETED);
	}

	private void updateContractInfo(Contract contract, UpdateLandlordInfoDto dto) {
		LandlordInfoConverter.updateFinal(contract.getLandlordInfo(), dto);
		SpecialClauseConverter.updateFinal(contract.getSpecialClause(), dto);
		contractImageService.updateLandlordSignatures(contract.getLandlordInfo(), dto);
		contract.updateContractStatus(ContractStatus.LANDLORD_COMPLETED);
	}

	@Transactional(readOnly = true)
	public LandlordInfoResponseDto getLandlordInfo(Long contractId, Long landlordId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getLandlordId())
			.filter(id -> id.equals(landlordId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_LANDLORD_ACCESS));
		return LandlordInfoConverter.toResponseDto(contract.getLandlordInfo());
	}

	@Transactional
	public void draftTenantInfo(UpdateTenantInfoDto requestDto, Long memberId) {
		Contract contract = validateTenantDraftContract(requestDto.getContractId(), memberId);
		TenantInfo tenantInfo = contract.getTenantInfo();
		TenantInfoConverter.updateDraft(tenantInfo, requestDto);
	}

	@Transactional
	public void finalTenantInfo(UpdateTenantInfoDto requestDto, Long memberId) {
		Contract contract = validateTenantFinalContract(requestDto.getContractId(), memberId);
		TenantInfo tenantInfo = contract.getTenantInfo();
		TenantInfoConverter.updateFinal(tenantInfo, requestDto);
		contract.updateContractStatus(ContractStatus.TENANT_COMPLETED);
	}

	@Transactional(readOnly = true)
	public TenantInfoResponseDto getTenantInfo(Long contractId, Long tenantId) {
		Contract contract = findContract(contractId);
		Optional.of(contract.getTenantId())
			.filter(id -> id.equals(tenantId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_TENANT_ACCESS));
		return TenantInfoConverter.toResponseDto(contract.getTenantInfo());
	}

	@Transactional(readOnly = true)
	public ContractStatusResponseDto getContractStatus(Long contractId, Long memberId) {
		Contract contract = findContract(contractId);
		validateUserAccess(contract, memberId);
		return ContractStatusResponseDto.builder()
			.contractId(contract.getContractId())
			.status(contract.getContractStatus())
			.build();
	}

	private void validateUserAccess(Contract contract, Long userId) {
		Optional.of(contract.getLandlordId())
			.filter(id -> id.equals(userId))
			.or(() -> Optional.of(contract.getTenantId())
				.filter(id -> id.equals(userId)))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS));
	}

	@Transactional(readOnly = true)
	public ContractDetailResponseDto getContractDetail(Long contractId, Long memberId) {
		Contract contract = findContract(contractId);
		validateUserAccess(contract, memberId);
		return ContractDetailConverter.toDto(contract);
	}

	@Transactional
	public void updateLandlordSignatures(LandlordSignatureUpdateRequestDto dto, Long memberId) {
		Contract contract = findContract(dto.getContractId());
		Optional.of(contract.getLandlordId())
			.filter(id -> id.equals(memberId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(status -> status.equals(ContractStatus.TENANT_SIGNED))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_LANDLORD_SIGNATURE));
		LandlordInfo landlordInfo = contract.getLandlordInfo();
		contractImageService.updateLastLandlordSignatures(landlordInfo, dto);
		contract.updateContractStatus(ContractStatus.COMPLETED);
		contract.getRoom().updateStatus(RoomStatus.SOLD_OUT);
	}

	@Transactional
	@RedisLock(key = "'contract:' + #requestDto.contractId", errorCode = RedisLockErrorCode.LANDLORD_IN_PROGRESS)
	public void updateTenantSignature(TenantSignatureUpdateRequestDto requestDto, Long memberId) {
		Contract contract = findContract(requestDto.getContractId());
		Optional.of(contract.getTenantId())
			.filter(id -> id.equals(memberId))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS));
		Optional.of(contract.getContractStatus())
			.filter(status -> status.equals(ContractStatus.TENANT_COMPLETED))
			.orElseThrow(() -> new BusinessException(ContractErrorCode.INVALID_CONTRACT_STATUS_FOR_TENANT_SIGNATURE));
		TenantInfo tenantInfo = contract.getTenantInfo();
		contractImageService.updateTenantSignature(tenantInfo, requestDto);
		contract.updateContractStatus(ContractStatus.TENANT_SIGNED);
	}

	@Transactional(readOnly = true)
	public Contract findContract(Long contractId) {
		return contractRepository.findByContractId(contractId)
			.orElseThrow(() -> new RoomException(ContractErrorCode.NOT_FOUND_CONTRACT));
	}

	@Transactional
	public void completeContract(CompleteDto completeDto, long memberId) {
		try {
			Contract contract = findContract(completeDto.getContractId());
			if (!contract.getLandlordId().equals(memberId)) {
				throw new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS);
			}

			// 1. AES 키 생성
			SecretKey aesKey = aesService.generateAESKey();

			// 2. AES 키를 RSA로 암호화
			String encryptedAesKey = rsaService.encryptAesKey(aesKey);

			// 3. PDF 파일을 AES로 암호화
			MultipartFile file = completeDto.getFile();
			byte[] pdfBytes = file.getBytes();
			byte[] encryptedPdf = aesService.encrypt(aesKey, pdfBytes);
			String ipfsKey = pinataStorageService.uploadEncryptedPdf(encryptedPdf,
				completeDto.getContractId());
			String encryptedIpfsKey = aesService.encryptToString(aesKey, ipfsKey);
			System.out.println(encryptedIpfsKey);

			// 4. 블록체인에 CID 저장 구현
			var result = blockchainService.registerContract(BigInteger.valueOf(completeDto.getContractId()),
				encryptedIpfsKey,
				BigInteger.valueOf(completeDto.getLandlord()),
				BigInteger.valueOf(completeDto.getTenant()));
			if (result == null) {
				throw new BusinessException(BlockchainErrorCode.BLOCKCHAIN_REJECTED);
			}

			// 5. DB 업데이트
			contract.updateAesKey(encryptedAesKey);
			contract.updateIpfsKey(encryptedIpfsKey);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}

	@Transactional(readOnly = true)
	public byte[] getPdf(long contractId, long memberId) {
		Contract contract = findContract(contractId);

		if (!contract.getLandlordId().equals(memberId) && !contract.getTenantId().equals(memberId)) {
			throw new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS);
		}

		try {
			SecretKey aesKey = rsaService.decryptAesKey(contract.getAesKey());
			String ipfsKey = aesService.decryptFromString(aesKey, contract.getIpfsKey());
			byte[] encryptedFileData = pinataStorageService.getFileFromIpfs(ipfsKey);
			return aesService.decrypt(aesKey, encryptedFileData);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			return null;
		}
	}

	@Transactional
	public void verifyContractMember(VerifyContractMemberDto dto, Long memberId) {
		Contract contract = findContract(dto.contractId());
		Member member = memberService.searchMember(memberId);
		IdentityDto.IdentityResponse identity = verificationService.getVerification(dto.identityVerificationId());

		validateContractRoleAccess(contract, memberId, dto.role());
		VerificationUtil.compareMemberInfo(member, identity);
		updateAuthStatus(contract, dto.role());
	}

	private void validateContractRoleAccess(Contract contract, Long memberId, ContractRole role) {
		switch (role) {
			case LANDLORD -> {
				if (!contract.getLandlordId().equals(memberId)) {
					throw new BusinessException(ContractErrorCode.NO_AUTH_TO_ACCESS_LANDLORD);
				}
			}
			case TENANT -> {
				if (!contract.getTenantId().equals(memberId)) {
					throw new BusinessException(ContractErrorCode.NO_AUTH_TO_ACCESS_TENANT);
				}
			}
			default -> throw new BusinessException(ContractErrorCode.INVALID_ROLE);
		}
	}

	@Transactional
	public void updateAuthStatus(Contract contract, ContractRole role) {
		switch (role) {
			case LANDLORD -> contract.updateLandlordAuth(true);
			case TENANT -> contract.updateTenantAuth(true);
			default -> throw new BusinessException(ContractErrorCode.INVALID_ROLE);
		}
	}

	@Transactional(readOnly = true)
	public ContractVerificationStatusDto getVerificationStatus(Long contractId, Long memberId) {
		var contract = findContract(contractId);

		if (!contract.getTenantId().equals(memberId) && !contract.getTenantId().equals(memberId)) {
			throw new BusinessException(ContractErrorCode.INVALID_CONTRACT_ACCESS);
		}

		return ContractConverter.convertContractVerify(contract);
	}

	@Transactional(readOnly = true)
	public Long findActiveContractId(Long roomId, Long memberId) {
		return contractRepository.findByRoom_RoomId(roomId)
			.filter(c -> memberId.equals(c.getTenantId()) || memberId.equals(c.getLandlordId()))
			.filter(c -> c.getContractStatus() != ContractStatus.COMPLETED)
			.map(Contract::getContractId)
			.orElse(0L);
	}
}
