package com.bangjwo.contract.domain.entity;

import com.bangjwo.contract.domain.vo.ContractStatus;
import com.bangjwo.global.common.entity.BaseEntity;
import com.bangjwo.room.domain.entity.Room;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Table(indexes = {
	@Index(name = "idx_room_id", columnList = "room_id"),
	@Index(name = "idx_landlord_id", columnList = "landlord_id"),
	@Index(name = "idx_tenant_id", columnList = "tenant_id"),
	@Index(name = "idx_special_clause_id", columnList = "special_clause_id")
})
public class Contract extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long contractId;

	@OneToOne
	@JoinColumn(
		name = "room_id",
		unique = true,
		foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
	)
	private Room room;

	@Column(name = "landlord_id", nullable = false)
	private Long landlordId;

	@Column(name = "tenant_id", nullable = false)
	private Long tenantId;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(
		name = "landlord_info_id",
		nullable = false,
		foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
	)
	private LandlordInfo landlordInfo;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(
		name = "tenant_info_id",
		nullable = false,
		foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
	)
	private TenantInfo tenantInfo;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(
		name = "special_clause_id",
		nullable = false,
		foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)
	)
	private SpecialClause specialClause;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String ipfsKey; // 암호화

	@Column(columnDefinition = "TEXT", nullable = false)
	private String aesKey;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private ContractStatus contractStatus;

	@Column(nullable = false)
	private Boolean landlordAuth;

	@Column(nullable = false)
	private Boolean tenantAuth;

	public void updateContractStatus(ContractStatus status) {
		this.contractStatus = status;
	}

	public void updateLandlordAuth(boolean isVerified) {
		this.landlordAuth = isVerified;
	}

	public void updateTenantAuth(boolean isVerified) {
		this.tenantAuth = isVerified;
	}

	public void updateIpfsKey(String ipfsKey) {
		this.ipfsKey = ipfsKey;
	}

	public void updateAesKey(String aesKey) {
		this.aesKey = aesKey;
	}

}
