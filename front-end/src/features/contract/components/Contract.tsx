import {
  useState,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from "react";
import ContractHeader from "./ContractHeader";
import HouseInfoSection from "./HouseInfoSection";
import ContractBody from "./ContractBody";
import SpecialTerms from "./SpecialTerms";
import SignatureModal from "./SignatureModal";
import ContractFooterSection from "./ContractFooterSection";
import {
  UpdateLandlordInfoDto,
  ContractType,
  MonthlyRentType,
} from "../data/contract.dto";

export interface ContractRefType {
  getFormData: () => UpdateLandlordInfoDto;
}

interface ContractProps {
  mode: "lessor" | "lessee";
}

interface FooterInfo {
  address: string;
  ssn: string;
  phone: string;
  name: string;
}

interface FooterState {
  lessor: FooterInfo;
  lessee: FooterInfo;
}

const Contract = forwardRef<ContractRefType, ContractProps>(({ mode }, ref) => {
  // LeaseType를 "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | null 으로 제한
  const [leaseType, setLeaseType] = useState<
    "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | null
  >(null);
  const [lessorName, setLessorName] = useState("");
  const [lesseeName, setLesseeName] = useState("");

  const [rentalPropertyAddress, setRentalPropertyAddress] = useState("");
  const [rentalPartAddress, setRentalPartAddress] = useState("");
  const [rentalHousingLandType, setRentalHousingLandType] = useState("");
  const [rentalHousingLandArea, setRentalHousingLandArea] = useState("");
  const [propertyStructure, setPropertyStructure] = useState("");
  const [propertyPurpose, setPropertyPurpose] = useState("");
  const [propertyArea, setPropertyArea] = useState("");
  const [rentalPartDetailAddress, setRentalPartDetailAddress] = useState("");
  const [rentalPartArea, setRentalPartArea] = useState("");

  // 내부 상태를 ContractType | null 로 관리 (하위 컴포넌트에는 string으로 전달)
  const [contractType, setContractType] = useState<ContractType | null>(null);

  const [taxArrears, setTaxArrears] = useState(false);
  const [priorityConfirmedDateYn, setPriorityConfirmedDateYn] = useState(false);

  // 금액 및 날짜 관련 상태
  const [depositAmount, setDepositAmount] = useState(0);
  const [contractFee, setContractFee] = useState(0);
  const [middleFee, setMiddleFee] = useState(0);
  const [interimPaymentDate, setInterimPaymentDate] = useState("");
  const [balance, setBalance] = useState(0);
  const [balancePaymentDate, setBalancePaymentDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [monthlyRentPaymentDate, setMonthlyRentPaymentDate] = useState("");
  const [monthlyRentType, setMonthlyRentType] =
    useState<MonthlyRentType | null>(null);
  const [monthlyRentAccountBank, setMonthlyRentAccountBank] = useState("");
  const [monthlyRentAccountNumber, setMonthlyRentAccountNumber] = useState("");
  const [fixedManagementFee, setFixedManagementFee] = useState(0);
  const [unfixedManagementFee, setUnfixedManagementFee] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState<string | null>(null);

  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [facilitiesRepairStatus, setFacilitiesRepairStatus] = useState(false);
  const [facilitiesRepairContent, setFacilitiesRepairContent] = useState("");
  const [repairCompletionByBalanceDate, setRepairCompletionByBalanceDate] =
    useState("");
  const [repairCompletionEtc, setRepairCompletionEtc] = useState("");
  const [notRepairedByBalanceDate, setNotRepairedByBalanceDate] = useState("");
  const [notRepairedEtc, setNotRepairedEtc] = useState("");
  const [landlordBurden, setLandlordBurden] = useState("");
  const [tenantBurden, setTenantBurden] = useState("");

  const [moveInRegistrationDate, setMoveInRegistrationDate] = useState("");
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [disputeResolution, setDisputeResolution] = useState(false);
  const [isHousingReconstructionPlanned, setIsHousingReconstructionPlanned] =
    useState(false);
  const [constructionPeriod, setConstructionPeriod] = useState("");
  const [estimatedConstructionDuration, setEstimatedConstructionDuration] =
    useState(0);
  const [isDetailedAddressConsentGiven, setIsDetailedAddressConsentGiven] =
    useState(false);
  const [etc, setEtc] = useState<string[]>([]);

  const [contractWrittenDate, setContractWrittenDate] = useState("");

  // Footer 정보를 상위에서 관리
  const [footerInfo, setFooterInfo] = useState<FooterState>({
    lessor: { address: "", ssn: "", phone: "", name: "" },
    lessee: { address: "", ssn: "", phone: "", name: "" },
  });

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [activeSignatureType, setActiveSignatureType] = useState<
    "unpaid" | "priority" | "receipt" | null
  >(null);

  const [unpaidTaxSignature, setUnpaidTaxSignature] = useState<string | null>(
    null
  );
  const [priorityDateSignature, setPriorityDateSignature] = useState<
    string | null
  >(null);

  const [receiptSignature, setReceiptSignature] = useState<string | null>(null);

  const openSignatureModal = (type: "unpaid" | "priority" | "receipt") => {
    if (type === "unpaid" || type === "priority" || type === "receipt") {
      setActiveSignatureType(type);
      setSignatureModalOpen(true);
    }
  };

  const handleSignatureSave = (dataUrl: string) => {
    if (activeSignatureType === "unpaid") {
      setUnpaidTaxSignature(dataUrl);
    } else if (activeSignatureType === "priority") {
      setPriorityDateSignature(dataUrl);
    } else if (activeSignatureType === "receipt") {
      setReceiptSignature(dataUrl);
    }
    setSignatureModalOpen(false);
  };

  useImperativeHandle(ref, () => ({
    getFormData: (): UpdateLandlordInfoDto => ({
      contractId: 2,
      leaseType,
      rentalPropertyAddress,
      rentalPartAddress,
      rentalHousingLandType,
      rentalHousingLandArea: Number(rentalHousingLandArea),
      propertyStructure,
      propertyPurpose,
      propertyArea: Number(propertyArea),
      rentalPartDetailAddress,
      rentalPartArea: Number(rentalPartArea),
      contractType,
      previousLeaseStartDate: "",
      previousLeaseEndDate: "",
      previousDepositAmount: 0,
      previousMonthlyRent: 0,
      taxArrears,
      priorityConfirmedDateYn,
      depositAmount,
      contractFee,
      middleFee,
      interimPaymentDate,
      balance,
      balancePaymentDate,
      monthlyRent,
      monthlyRentPaymentDate,
      monthlyRentType,
      monthlyRentAccountBank,
      monthlyRentAccountNumber,
      fixedManagementFee,
      unfixedManagementFee,
      leaseStartDate: leaseStartDate ?? "",
      leaseEndDate,
      facilitiesRepairStatus,
      facilitiesRepairContent,
      repairCompletionByBalanceDate,
      repairCompletionEtc,
      notRepairedByBalanceDate,
      notRepairedEtc,
      landlordBurden,
      tenantBurden,
      moveInRegistrationDate,
      unpaidAmount,
      disputeResolution,
      isHousingReconstructionPlanned,
      constructionPeriod,
      estimatedConstructionDuration,
      isDetailedAddressConsentGiven,
      etc,
      contractWrittenDate,
      // Footer 정보 (임대인 정보 사용)
      address: footerInfo.lessor.address,
      residentRegistrationNumber: footerInfo.lessor.ssn,
      phoneNumber: footerInfo.lessor.phone,
      name: footerInfo.lessor.name,
    }),
  }));

  return (
    <section className="min-h-screen bg-white">
      <ContractHeader
        mode={mode}
        lessorName={lessorName}
        lesseeName={lesseeName}
        onLessorNameChange={setLessorName}
        onLesseeNameChange={setLesseeName}
        leaseType={leaseType}
        setLeaseType={setLeaseType}
      />

      <HouseInfoSection
        mode={mode}
        contractType={contractType || ""}
        setContractType={(value: string) =>
          setContractType(value as ContractType)
        }
        rentalPartDetailAddress={rentalPartDetailAddress}
        address={rentalPropertyAddress}
        detailAddress={rentalPartAddress}
        landPurpose={rentalHousingLandType}
        landArea={rentalHousingLandArea}
        buildingStructure={propertyStructure}
        buildingUsage={propertyPurpose}
        buildingArea={propertyArea}
        leaseDetail={rentalPartDetailAddress}
        leaseArea={rentalPartArea}
        unpaidTaxOption={taxArrears}
        priorityDateOption={priorityConfirmedDateYn ? "exist" : "none"}
        unpaidTaxSignature={unpaidTaxSignature}
        priorityDateSignature={priorityDateSignature}
        openSignatureModal={openSignatureModal}
        onChange={(field, value) => {
          const map: Record<string, Dispatch<SetStateAction<string>>> = {
            leaseDetail: setRentalPartDetailAddress,
            rentalPartDetailAddress: setRentalPartDetailAddress,
            address: setRentalPropertyAddress,
            detailAddress: setRentalPartAddress,
            landPurpose: setRentalHousingLandType,
            landArea: setRentalHousingLandArea,
            buildingStructure: setPropertyStructure,
            buildingUsage: setPropertyPurpose,
            buildingArea: setPropertyArea,
            leaseArea: setRentalPartArea,
          };
          if (map[field]) {
            map[field](value);
          }
        }}
        onOptionChange={(field, value) => {
          if (field === "unpaidTaxOption") setTaxArrears(value === "exist");
          if (field === "priorityDateOption")
            setPriorityConfirmedDateYn(value === "exist");
        }}
      />

      <ContractBody
        mode={mode}
        deposit={depositAmount}
        setDeposit={setDepositAmount}
        contractFee={contractFee}
        setContractFee={setContractFee}
        monthlyRent={monthlyRent}
        setMonthlyRent={setMonthlyRent}
        monthlyRentType={monthlyRentType}
        setPaymentMethod={setMonthlyRentType}
        middleFee={middleFee}
        setMiddleFee={setMiddleFee}
        finalPayment={balance}
        setFinalPayment={setBalance}
        middlePaymentDate={
          interimPaymentDate ? new Date(interimPaymentDate) : null
        }
        setMiddlePaymentDate={(date: Date | null) =>
          setInterimPaymentDate(date ? date.toISOString() : "")
        }
        balancePaymentDate={
          balancePaymentDate ? new Date(balancePaymentDate) : null
        }
        setBalancePaymentDate={(date: Date | null) =>
          setBalancePaymentDate(date ? date.toISOString() : "")
        }
        monthlyRentPaymentDate={
          monthlyRentPaymentDate ? new String(monthlyRentPaymentDate) : null
        }
        setMonthlyRentPaymentDate={(date: String | null) =>
          setMonthlyRentPaymentDate(date ? date.toString() : "")
        }
        monthlyRentAccountBank={monthlyRentAccountBank}
        setMonthlyRentAccountBank={setMonthlyRentAccountBank}
        monthlyRentAccountNumber={monthlyRentAccountNumber}
        setMonthlyRentAccountNumber={setMonthlyRentAccountNumber}
        fixedManagementFee={fixedManagementFee}
        setFixedManagementFee={setFixedManagementFee}
        unfixedManagementFee={unfixedManagementFee}
        setUnfixedManagementFee={setUnfixedManagementFee}
        leaseStartDate={leaseStartDate ? new Date(leaseStartDate) : null}
        setLeaseStartDate={(date: Date | null) =>
          setLeaseStartDate(date ? date.toISOString() : "")
        }
        leaseEndDate={leaseEndDate ? new Date(leaseEndDate) : null}
        setLeaseEndDate={(date: Date | null) =>
          setLeaseEndDate(date ? date.toISOString() : "")
        }
        facilitiesRepairStatus={facilitiesRepairStatus}
        setFacilitiesRepairStatus={setFacilitiesRepairStatus}
        facilitiesRepairContent={facilitiesRepairContent}
        setFacilitiesRepairContent={setFacilitiesRepairContent}
        repairCompletionByBalanceDate={
          repairCompletionByBalanceDate
            ? new Date(repairCompletionByBalanceDate)
            : null
        }
        setRepairCompletionByBalanceDate={(date: Date | null) =>
          setRepairCompletionByBalanceDate(date ? date.toISOString() : "")
        }
        repairCompletionEtc={repairCompletionEtc}
        setRepairCompletionEtc={setRepairCompletionEtc}
        notRepairedByBalanceDate={
          notRepairedByBalanceDate ? new Date(notRepairedByBalanceDate) : null
        }
        setNotRepairedByBalanceDate={(date: Date | null) =>
          setNotRepairedByBalanceDate(date ? date.toISOString() : "")
        }
        notRepairedEtc={notRepairedEtc}
        setNotRepairedEtc={setNotRepairedEtc}
        landlordBurden={landlordBurden}
        setLandlordBurden={setLandlordBurden}
        tenantBurden={tenantBurden}
        setTenantBurden={setTenantBurden}
        receiptSignature={receiptSignature}
        openSignatureModal={openSignatureModal}
      />

      <SpecialTerms
        mode={mode}
        moveInRegistrationDate={
          moveInRegistrationDate ? new Date(moveInRegistrationDate) : null
        }
        setMoveInRegistrationDate={(date: Date | null) =>
          setMoveInRegistrationDate(date ? date.toISOString() : "")
        }
        unpaidAmount={unpaidAmount}
        setUnpaidAmount={setUnpaidAmount}
        disputeResolution={disputeResolution}
        setDisputeResolution={setDisputeResolution}
        isHousingReconstructionPlanned={isHousingReconstructionPlanned}
        setIsHousingReconstructionPlanned={setIsHousingReconstructionPlanned}
        constructionPeriod={constructionPeriod}
        setConstructionPeriod2={setConstructionPeriod}
        estimatedConstructionDuration={estimatedConstructionDuration}
        setEstimatedConstructionDuration={setEstimatedConstructionDuration}
        isDetailedAddressConsentGiven={isDetailedAddressConsentGiven}
        setIsDetailedAddressConsentGiven={setIsDetailedAddressConsentGiven}
        etc={etc}
        setEtc={setEtc}
      />

      <ContractFooterSection
        mode={mode} // or "lessee" - 권한 부여
        footerInfo={footerInfo}
        setFooterInfo={setFooterInfo}
        contractWrittenDate={contractWrittenDate}
        setContractWrittenDate={setContractWrittenDate}
      />

      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </section>
  );
});

export default Contract;
