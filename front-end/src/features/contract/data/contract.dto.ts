export type LeaseType = "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | "DEPOSIT_ONLY";
export type ContractType = "NEW" | "RENEW_BY_AGREEMENT" | "EXTENSION";
export type MonthlyRentType = "PREPAID" | "POSTPAID";

export interface UpdateLandlordInfoDto {
  contractId: number;
  leaseType: LeaseType | null; // ✅ null 허용
  rentalPropertyAddress: string;
  rentalPartAddress: string;
  rentalHousingLandType: string;
  rentalHousingLandArea: number;
  propertyStructure: string;
  propertyPurpose: string;
  propertyArea: number;
  rentalPartDetailAddress: string;
  rentalPartArea: number;
  contractType: ContractType | null; // ✅ null 허용
  previousLeaseStartDate: string;
  previousLeaseEndDate: string;
  previousDepositAmount: number;
  previousMonthlyRent: number;
  taxArrears: boolean;
  priorityConfirmedDateYn: boolean;
  depositAmount: number;
  contractFee: number;
  middleFee: number;
  interimPaymentDate: string;
  balance: number;
  balancePaymentDate: string;
  monthlyRent: number;
  monthlyRentPaymentDate: string;
  monthlyRentType: MonthlyRentType | null; // ✅ null 허용
  monthlyRentAccountBank: string;
  monthlyRentAccountNumber: string;
  fixedManagementFee: number;
  unfixedManagementFee: string;
  leaseStartDate: string;
  leaseEndDate: string;
  facilitiesRepairStatus: boolean;
  facilitiesRepairContent: string;
  repairCompletionByBalanceDate: string;
  repairCompletionEtc: string;
  notRepairedByBalanceDate: string;
  notRepairedEtc: string;
  landlordBurden: string;
  tenantBurden: string;
  moveInRegistrationDate: string;
  unpaidAmount: number;
  disputeResolution: boolean;
  isHousingReconstructionPlanned: boolean;
  constructionPeriod: string;
  estimatedConstructionDuration: number;
  isDetailedAddressConsentGiven: boolean;
  etc: string[];
  contractWrittenDate: string;
  address: string;
  residentRegistrationNumber: string;
  phoneNumber: string;
  name: string;
  landlordSignatureUrl1: string;
  landlordSignatureUrl2: string;
  landlordSignatureUrl3: string;
}
