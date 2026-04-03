import {
  useState,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import axiosInstance from "../../../utils/axiosInstances";
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
  roomData?: RoomDetailDto;
  contractId?: number;
}

export interface RoomDetailDto {
  address: string;
  addressDetail: string;
  deposit: number;
  monthlyRent: number;
  maintenanceCost: number;
  availableFrom: string;
  exclusiveArea: number;
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

const Contract = forwardRef<ContractRefType, ContractProps>(
  ({ mode, roomData, contractId }, ref) => {
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

    const [contractType, setContractType] = useState<ContractType | null>(null);

    const [taxArrears, setTaxArrears] = useState<boolean | null>(null);
    const [priorityConfirmedDateYn, setPriorityConfirmedDateYn] = useState<boolean | null>(null);

    const [depositAmount, setDepositAmount] = useState<number | "">("");
    const [contractFee, setContractFee] = useState<number | "">("");
    const [middleFee, setMiddleFee] = useState<number | "">("");
    const [interimPaymentDate, setInterimPaymentDate] = useState("");
    const [balance, setBalance] = useState<number | "">("");
    const [balancePaymentDate, setBalancePaymentDate] = useState("");
    const [monthlyRent, setMonthlyRent] = useState<number | "">("");
    const [monthlyRentPaymentDate, setMonthlyRentPaymentDate] = useState("");
    const [monthlyRentType, setMonthlyRentType] = useState<MonthlyRentType | null>(null);
    const [monthlyRentAccountBank, setMonthlyRentAccountBank] = useState("");
    const [monthlyRentAccountNumber, setMonthlyRentAccountNumber] = useState("");
    const [fixedManagementFee, setFixedManagementFee] = useState<number | "">("");
    const [unfixedManagementFee, setUnfixedManagementFee] = useState("");
    const [leaseStartDate, setLeaseStartDate] = useState<string | null>(null);

    const [leaseEndDate, setLeaseEndDate] = useState("");
    const [facilitiesRepairStatus, setFacilitiesRepairStatus] = useState<boolean | null>(null);
    const [facilitiesRepairContent, setFacilitiesRepairContent] = useState("");
    const [repairCompletionByBalanceDate, setRepairCompletionByBalanceDate] = useState("");
    const [repairCompletionEtc, setRepairCompletionEtc] = useState("");
    const [notRepairedByBalanceDate, setNotRepairedByBalanceDate] = useState("");
    const [notRepairedEtc, setNotRepairedEtc] = useState("");
    const [landlordBurden, setLandlordBurden] = useState("");
    const [tenantBurden, setTenantBurden] = useState("");

    const [moveInRegistrationDate, setMoveInRegistrationDate] = useState("");
    const [unpaidAmount, setUnpaidAmount] = useState(0);
    const [disputeResolution, setDisputeResolution] = useState(false);
    const [isHousingReconstructionPlanned, setIsHousingReconstructionPlanned] = useState<boolean | null>(null);
    const [isDetailedAddressConsentGiven, setIsDetailedAddressConsentGiven] = useState<boolean | null>(null);
    const [constructionPeriod, setConstructionPeriod] = useState("");
    const [estimatedConstructionDuration, setEstimatedConstructionDuration] = useState(0);
    const [etc, setEtc] = useState<string[]>([]);

    const [contractWrittenDate, setContractWrittenDate] = useState("");

    const [footerInfo, setFooterInfo] = useState<FooterState>({
      lessor: { address: "", ssn: "", phone: "", name: "" },
      lessee: { address: "", ssn: "", phone: "", name: "" },
    });

    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [activeSignatureType, setActiveSignatureType] = useState<
      "unpaid" | "priority" | "receipt" | null
    >(null);

    const [unpaidTaxSignature, setUnpaidTaxSignature] = useState<string | null>(null);
    const [priorityDateSignature, setPriorityDateSignature] = useState<string | null>(null);
    const [receiptSignature, setReceiptSignature] = useState<string | null>(null);

    useEffect(() => {
      const fetchContractData = async () => {
        try {
          let url = "";
          if (contractId) {
            url = `/api/v1/contract/detail?contractId=${contractId}`;
          } else if (roomData && (roomData as any).roomId) {
            url = `/api/v1/room/${(roomData as any).roomId}`;
          } else {
            throw new Error("조회할 ID가 없습니다.");
          }

          const response = await axiosInstance.get(url);
          const data = response.data;

          console.log("🔥 서버에서 무사히 가져온 전체 데이터:", data);

          setRentalPropertyAddress(data.rentalPropertyAddress || "");
          setRentalPartAddress(data.rentalPartAddress || "");
          setRentalHousingLandType(data.rentalHousingLandType || "");
          setRentalHousingLandArea(data.rentalHousingLandArea != null ? String(data.rentalHousingLandArea) : "");
          setPropertyStructure(data.propertyStructure || "");
          setPropertyPurpose(data.propertyPurpose || "");
          setPropertyArea(data.propertyArea != null ? String(data.propertyArea) : "");
          setRentalPartDetailAddress(data.rentalPartDetailAddress || "");
          setRentalPartArea(data.rentalPartArea != null ? String(data.rentalPartArea) : "");

          setContractType(data.contractType || null);
          setTaxArrears(data.taxArrears ?? null);
          setPriorityConfirmedDateYn(data.priorityConfirmedDateYn ?? null);

          setDepositAmount(data.depositAmount ?? "");
          setContractFee(data.contractFee ?? "");
          setMiddleFee(data.middleFee ?? "");
          setBalance(data.balance ?? "");
          setMonthlyRent(data.monthlyRent ?? "");
          setFixedManagementFee(data.fixedManagementFee ?? "");
          setUnfixedManagementFee(data.unfixedManagementFee || "");

          setMonthlyRentAccountNumber(data.monthlyRentAccountNumber || "");
          setMonthlyRentAccountBank(data.monthlyRentAccountBank || "");
          setMonthlyRentPaymentDate(data.monthlyRentPaymentDate || "");
          setMonthlyRentType(data.monthlyRentType || null);

          setInterimPaymentDate(data.interimPaymentDate || "");
          setBalancePaymentDate(data.balancePaymentDate || "");
          setLeaseStartDate(data.leaseStartDate || null);
          setLeaseEndDate(data.leaseEndDate || "");

          setFacilitiesRepairStatus(data.facilitiesRepairStatus ?? null);
          setFacilitiesRepairContent(data.facilitiesRepairContent || "");
          setRepairCompletionByBalanceDate(data.repairCompletionByBalanceDate || "");
          setRepairCompletionEtc(data.repairCompletionEtc || "");
          setNotRepairedByBalanceDate(data.notRepairedByBalanceDate || "");
          setNotRepairedEtc(data.notRepairedEtc || "");
          setLandlordBurden(data.landlordBurden || "");
          setTenantBurden(data.tenantBurden || "");

          setMoveInRegistrationDate(data.moveInRegistrationDate || "");
          setUnpaidAmount(data.unpaidAmount ?? 0);
          setDisputeResolution(data.disputeResolution ?? false);
          setIsHousingReconstructionPlanned(data.isHousingReconstructionPlanned ?? null);
          setIsDetailedAddressConsentGiven(data.isDetailedAddressConsentGiven ?? null);
          setConstructionPeriod(data.constructionPeriod || "");
          setEstimatedConstructionDuration(data.estimatedConstructionDuration ?? 0);
          setEtc(data.etc || []);
          setContractWrittenDate(data.contractWrittenDate || "");
          setLeaseType(data.leaseType || null);

          const lessorData = data.landlordInfo || data;

          setFooterInfo((prev) => ({
            ...prev,
            lessor: {
              address: data.landlordAddress || "",
              ssn: data.residentRegistrationNumber || "",
              phone: data.landlordPhone || "",
              name: data.landlordName || "",
            },
          }));

          setUnpaidTaxSignature(lessorData.landlordSignatureUrl1 || data.landlordSignatureUrl1 || null);
          setPriorityDateSignature(lessorData.landlordSignatureUrl2 || data.landlordSignatureUrl2 || null);
          setReceiptSignature(lessorData.landlordSignatureUrl3 || data.landlordSignatureUrl3 || null);

        } catch (error) {
          console.error("❌ 계약서 불러오기 에러:", error);
        }
      };

      fetchContractData();
    }, [roomData, contractId, mode]);

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
        contractId: contractId || 0,
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
        taxArrears: taxArrears ?? false,
        priorityConfirmedDateYn: priorityConfirmedDateYn ?? false,
        depositAmount: Number(depositAmount) || 0,
        contractFee: Number(contractFee) || 0,
        middleFee: Number(middleFee) || 0,
        interimPaymentDate,
        balance: Number(balance) || 0,
        balancePaymentDate,
        monthlyRent: Number(monthlyRent) || 0,
        monthlyRentPaymentDate,
        monthlyRentType,
        monthlyRentAccountBank,
        monthlyRentAccountNumber,
        fixedManagementFee: Number(fixedManagementFee) || 0,
        unfixedManagementFee,
        leaseStartDate: leaseStartDate ?? "",
        leaseEndDate,
        facilitiesRepairStatus: facilitiesRepairStatus ?? false,
        facilitiesRepairContent,
        repairCompletionByBalanceDate,
        repairCompletionEtc,
        notRepairedByBalanceDate,
        notRepairedEtc,
        landlordBurden,
        tenantBurden,
        moveInRegistrationDate,
        unpaidAmount,
        disputeResolution: disputeResolution ?? false,
        isHousingReconstructionPlanned: isHousingReconstructionPlanned ?? false,
        constructionPeriod,
        estimatedConstructionDuration,
        isDetailedAddressConsentGiven: isDetailedAddressConsentGiven ?? false,
        etc,
        contractWrittenDate,
        address: footerInfo.lessor.address,
        residentRegistrationNumber: footerInfo.lessor.ssn,
        phoneNumber: footerInfo.lessor.phone,
        name: footerInfo.lessor.name,
        
        
        landlordSignatureUrl1: unpaidTaxSignature || "",
        landlordSignatureUrl2: priorityDateSignature || "",
        landlordSignatureUrl3: receiptSignature || "",
      }),
      
      getSignatures: () => ({
        sig1: unpaidTaxSignature,
        sig2: priorityDateSignature,
        sig3: receiptSignature,
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
          unpaidTaxOption={taxArrears as any}
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
            monthlyRentPaymentDate ? String(monthlyRentPaymentDate) : null
          }
          setMonthlyRentPaymentDate={(date: string | null) =>
            setMonthlyRentPaymentDate(date ? date : "")
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
          mode={mode}
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
  }
);

export default Contract;