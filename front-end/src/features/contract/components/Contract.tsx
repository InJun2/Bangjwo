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
  UpdateTenantInfoDto,
  ContractType,
  MonthlyRentType,
} from "../data/contract.dto";

export interface ContractRefType {
  getFormData: () => UpdateLandlordInfoDto;
  getTenantFormData: () => UpdateTenantInfoDto;
  getSignatures: () => any;
}

interface ContractProps {
  mode: "lessor" | "lessee";
  roomData?: RoomDetailDto;
  contractId?: number;
  isReadOnly?: boolean;
  isCompleted?: boolean;
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
  moveInDate?: string;
  signatureUrl?: string;
}

interface FooterState {
  lessor: FooterInfo;
  lessee: FooterInfo;
}

const Contract = forwardRef<ContractRefType, ContractProps>(
  ({ mode, roomData, contractId, isReadOnly = false, isCompleted = false }, ref) => {
    
    // 🚀 모든 객관식 초기값을 null로 두어 '초록색 테두리' 활성화
    const [leaseType, setLeaseType] = useState<string | null>(null);
    const [contractType, setContractType] = useState<ContractType | null>(null);
    const [monthlyRentType, setMonthlyRentType] = useState<MonthlyRentType | null>("선불" as any); // 요구사항: 선불 기본

    const [rentalPropertyAddress, setRentalPropertyAddress] = useState("");
    const [rentalPartAddress, setRentalPartAddress] = useState("");
    const [rentalHousingLandType, setRentalHousingLandType] = useState("");
    const [rentalHousingLandArea, setRentalHousingLandArea] = useState("");
    const [propertyStructure, setPropertyStructure] = useState("");
    const [propertyPurpose, setPropertyPurpose] = useState("");
    const [propertyArea, setPropertyArea] = useState("");
    const [rentalPartDetailAddress, setRentalPartDetailAddress] = useState("");
    const [rentalPartArea, setRentalPartArea] = useState("");

    // 🚀 동의/미동의 항목 초기값 null
    const [taxArrears, setTaxArrears] = useState<boolean | null>(null);
    const [priorityConfirmedDateYn, setPriorityConfirmedDateYn] = useState<boolean | null>(null);

    // 🚀 금액 및 숫자 항목 초기값 "" (빈칸)
    const [depositAmount, setDepositAmount] = useState<number | "">("");
    const [contractFee, setContractFee] = useState<number | "">("");
    const [middleFee, setMiddleFee] = useState<number | "">("");
    const [interimPaymentDate, setInterimPaymentDate] = useState("");
    const [balance, setBalance] = useState<number | "">("");
    const [balancePaymentDate, setBalancePaymentDate] = useState("");
    const [monthlyRent, setMonthlyRent] = useState<number | "">("");
    const [monthlyRentPaymentDate, setMonthlyRentPaymentDate] = useState("");
    
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
    const [unpaidAmount, setUnpaidAmount] = useState<number | "">("");
    const [disputeResolution, setDisputeResolution] = useState<boolean | null>(null);
    const [isHousingReconstructionPlanned, setIsHousingReconstructionPlanned] = useState<boolean | null>(null);
    const [isDetailedAddressConsentGiven, setIsDetailedAddressConsentGiven] = useState<boolean | null>(null);
    const [constructionPeriod, setConstructionPeriod] = useState("");
    const [estimatedConstructionDuration, setEstimatedConstructionDuration] = useState<number | "">("");
    const [etc, setEtc] = useState<string[]>([]);

    const [contractWrittenDate, setContractWrittenDate] = useState("");

    const [footerInfo, setFooterInfo] = useState<FooterState>({
      lessor: { address: "", ssn: "", phone: "", name: "", signatureUrl: "" },
      lessee: { address: "", ssn: "", phone: "", name: "", moveInDate: "", signatureUrl: "" },
    });

    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [activeSignatureType, setActiveSignatureType] = useState<
      "unpaid" | "priority" | "receipt" | "final" | null
    >(null);

    const [unpaidTaxSignature, setUnpaidTaxSignature] = useState<string | null>(null);
    const [priorityDateSignature, setPriorityDateSignature] = useState<string | null>(null);
    const [receiptSignature, setReceiptSignature] = useState<string | null>(null);
    const [finalSignature, setFinalSignature] = useState<string | null>(null);

    const handleSignClick = () => {
      if (isCompleted) return;
      
      if (!isReadOnly) {
        alert("최종 서명은 모든 계약 내용을 작성하고 '등록 완료'를 누른 후,\n다음 [최종 확인 페이지]에서 진행할 수 있습니다.");
        return;
      }
      
      setActiveSignatureType("final");
      setSignatureModalOpen(true);
    };

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

          // 🚀 1. 백엔드에서 0으로 넘어오면 모조리 "" 로 쳐내는 파서
          const parseNum = (val: any) => (val === 0 || val === "0" || !val) ? "" : Number(val);
          const parseNumStr = (val: any) => (val === 0 || val === "0" || !val) ? "" : String(val);
          
          // 🚀 2. DB 기본값인 false가 넘어올 때, 작성된 적 없는 새 계약서면 전부 null 로 초기화하여 초록색 띠 생성!
          const parseBool = (val: any) => {
            if (val === true) return true;
            if (val === false) {
              return data.contractWrittenDate ? false : null;
            }
            return null;
          };

          setRentalPropertyAddress(data.rentalPropertyAddress || "");
          setRentalPartAddress(data.rentalPartAddress || "");
          setRentalHousingLandType(data.rentalHousingLandType || "");
          setPropertyStructure(data.propertyStructure || "");
          setPropertyPurpose(data.propertyPurpose || "");
          setRentalPartDetailAddress(data.rentalPartDetailAddress || "");
          
          // 면적 0 방지
          setRentalHousingLandArea(parseNumStr(data.rentalHousingLandArea));
          setPropertyArea(parseNumStr(data.propertyArea));
          setRentalPartArea(parseNumStr(data.rentalPartArea));

          // 임대유형, 계약유형 강제 할당 방지 (null 유지)
          setContractType(data.contractType || null);
          setMonthlyRentType(data.monthlyRentType || null);
          let parsedLeaseType = data.leaseType;
          if (parsedLeaseType === "MONTHLY_RENT" || parsedLeaseType === "JEONSE") {
            parsedLeaseType = "MONTHLY_WITH_DEPOSIT";
          }
          setLeaseType(data.leaseType || null);

          // 불리언 항목들 회색(false)으로 채워지는 현상 방지
          setTaxArrears(parseBool(data.taxArrears));
          setPriorityConfirmedDateYn(parseBool(data.priorityConfirmedDateYn));
          setFacilitiesRepairStatus(parseBool(data.facilitiesRepairStatus));
          setDisputeResolution(parseBool(data.disputeResolution));
          setIsHousingReconstructionPlanned(parseBool(data.isHousingReconstructionPlanned));
          setIsDetailedAddressConsentGiven(parseBool(data.isDetailedAddressConsentGiven));

          // 금액 0 방지
          setDepositAmount(parseNum(data.depositAmount));
          setContractFee(parseNum(data.contractFee));
          setMiddleFee(parseNum(data.middleFee));
          setBalance(parseNum(data.balance));
          setMonthlyRent(parseNum(data.monthlyRent));
          setFixedManagementFee(parseNum(data.fixedManagementFee));
          setUnpaidAmount(parseNum(data.unpaidAmount));
          setEstimatedConstructionDuration(parseNum(data.estimatedConstructionDuration));

          setMonthlyRentAccountNumber(data.monthlyRentAccountNumber || "");
          setMonthlyRentAccountBank(data.monthlyRentAccountBank || "");
          setMonthlyRentPaymentDate(data.monthlyRentPaymentDate || "");

          setUnfixedManagementFee(data.unfixedManagementFee || "");

          setInterimPaymentDate(data.interimPaymentDate || "");
          setBalancePaymentDate(data.balancePaymentDate || "");
          setLeaseStartDate(data.leaseStartDate || null);
          setLeaseEndDate(data.leaseEndDate || "");

          setFacilitiesRepairContent(data.facilitiesRepairContent || "");
          setRepairCompletionByBalanceDate(data.repairCompletionByBalanceDate || "");
          setRepairCompletionEtc(data.repairCompletionEtc || "");
          setNotRepairedByBalanceDate(data.notRepairedByBalanceDate || "");
          setNotRepairedEtc(data.notRepairedEtc || "");
          setLandlordBurden(data.landlordBurden || "");
          setTenantBurden(data.tenantBurden || "");

          setMoveInRegistrationDate(data.moveInRegistrationDate || "");
          setConstructionPeriod(data.constructionPeriod || "");
          setEtc(data.etc || []);
          setContractWrittenDate(data.contractWrittenDate || "");

          const lessorObj = data.landlordInfo || data.landlord || {};
          const lesseeObj = data.tenantInfo || data.tenant || {};

          setFooterInfo((prev) => ({
            ...prev,
            lessor: {
              address: lessorObj.address || lessorObj.landlordAddress || data.landlordAddress || data.address || "",
              ssn: lessorObj.residentRegistrationNumber || lessorObj.landlordResidentNumber || data.landlordResidentNumber || data.residentRegistrationNumber || "",
              phone: lessorObj.phone || lessorObj.phoneNumber || lessorObj.landlordPhone || data.landlordPhone || data.phoneNumber || "",
              name: lessorObj.name || lessorObj.landlordName || data.landlordName || data.name || "",
              signatureUrl: lessorObj.landlordSignatureUrl4 || lessorObj.signatureUrl || data.landlordSignatureUrl4 || "",
            },
            lessee: {
              address: lesseeObj.address || lesseeObj.tenantAddress || data.tenantAddress || "",
              ssn: lesseeObj.residentRegistrationNumber || lesseeObj.tenantResidentNumber || lesseeObj.tenantResidentRegistrationNumber || data.tenantResidentNumber || data.tenantResidentRegistrationNumber || "",
              phone: lesseeObj.phone || lesseeObj.phoneNumber || lesseeObj.tenantPhone || data.tenantPhone || data.tenantPhoneNumber || "",
              name: lesseeObj.name || lesseeObj.tenantName || data.tenantName || "",
              moveInDate: lesseeObj.moveInDate || data.moveInDate || "",
              signatureUrl: lesseeObj.tenantSignatureUrl || lesseeObj.signatureUrl || data.tenantSignatureUrl || "",
            },
          }));

          setUnpaidTaxSignature(lessorObj.landlordSignatureUrl1 || data.landlordSignatureUrl1 || null);
          setPriorityDateSignature(lessorObj.landlordSignatureUrl2 || data.landlordSignatureUrl2 || null);
          setReceiptSignature(lessorObj.landlordSignatureUrl3 || data.landlordSignatureUrl3 || null);

        } catch (error) {
          console.error(error);
        }
      };

      fetchContractData();
    }, [roomData, contractId, mode]);

    const openSignatureModal = (type: "unpaid" | "priority" | "receipt") => {
      if (isCompleted) return;

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
      if (activeSignatureType === "final") {
        setFinalSignature(dataUrl);
        setFooterInfo((prev) => ({
          ...prev,
          [mode]: { ...prev[mode], signatureUrl: dataUrl },
        }));
      }
      setSignatureModalOpen(false);
    };

    useImperativeHandle(ref, () => ({
      getFormData: (): UpdateLandlordInfoDto => {
        const formData = {
          contractId: contractId || 0,
          leaseType: leaseType as any,
          rentalPropertyAddress,
          rentalPartAddress,
          rentalHousingLandType,
          rentalHousingLandArea: rentalHousingLandArea ? Number(rentalHousingLandArea) : ("" as any),
          propertyStructure,
          propertyPurpose,
          propertyArea: propertyArea ? Number(propertyArea) : ("" as any),
          rentalPartDetailAddress,
          rentalPartArea: rentalPartArea ? Number(rentalPartArea) : ("" as any),
          contractType: contractType as any,
          previousLeaseStartDate: "",
          previousLeaseEndDate: "",
          previousDepositAmount: 0,
          previousMonthlyRent: 0,
          taxArrears: taxArrears ?? ("" as any),
          priorityConfirmedDateYn: priorityConfirmedDateYn ?? ("" as any),
          depositAmount: depositAmount === "" ? ("" as any) : Number(depositAmount),
          contractFee: contractFee === "" ? ("" as any) : Number(contractFee),
          middleFee: middleFee === "" ? ("" as any) : Number(middleFee),
          interimPaymentDate,
          balance: balance === "" ? ("" as any) : Number(balance),
          balancePaymentDate,
          monthlyRent: monthlyRent === "" ? ("" as any) : Number(monthlyRent),
          monthlyRentPaymentDate,
          monthlyRentType: monthlyRentType as any,
          monthlyRentAccountBank,
          monthlyRentAccountNumber,
          fixedManagementFee: fixedManagementFee === "" ? ("" as any) : Number(fixedManagementFee),
          unfixedManagementFee,
          leaseStartDate: leaseStartDate ?? "",
          leaseEndDate,
          facilitiesRepairStatus: facilitiesRepairStatus ?? ("" as any),
          facilitiesRepairContent,
          repairCompletionByBalanceDate,
          repairCompletionEtc,
          notRepairedByBalanceDate,
          notRepairedEtc,
          landlordBurden,
          tenantBurden,
          moveInRegistrationDate,
          unpaidAmount: unpaidAmount === "" ? ("" as any) : Number(unpaidAmount),
          disputeResolution: disputeResolution ?? ("" as any),
          isHousingReconstructionPlanned: isHousingReconstructionPlanned ?? ("" as any),
          constructionPeriod,
          estimatedConstructionDuration: estimatedConstructionDuration === "" ? ("" as any) : Number(estimatedConstructionDuration),
          isDetailedAddressConsentGiven: isDetailedAddressConsentGiven ?? ("" as any),
          etc,
          contractWrittenDate,
          address: footerInfo.lessor.address,
          residentRegistrationNumber: footerInfo.lessor.ssn,
          phoneNumber: footerInfo.lessor.phone,
          name: footerInfo.lessor.name,
          landlordSignatureUrl1: unpaidTaxSignature || "",
          landlordSignatureUrl2: priorityDateSignature || "",
          landlordSignatureUrl3: receiptSignature || "",
        };

        return formData as UpdateLandlordInfoDto;
      },

      getTenantFormData: (): UpdateTenantInfoDto => ({
        contractId: contractId || 0,
        name: footerInfo.lessee.name,
        phone: footerInfo.lessee.phone,
        address: footerInfo.lessee.address,
        residentRegistrationNumber: footerInfo.lessee.ssn,
        moveInDate: footerInfo.lessee.moveInDate || "", 
      }),
      
      getSignatures: () => ({
        sig1: unpaidTaxSignature,
        sig2: priorityDateSignature,
        sig3: receiptSignature,
        finalSignature: finalSignature,
      }),
    }));

    return (
      <section className="min-h-screen bg-white">
        <div className={isReadOnly ? "pointer-events-none opacity-90" : ""}>
          <ContractHeader
            mode={mode}
            lessorName={footerInfo.lessor.name} 
            lesseeName={footerInfo.lessee.name}
            onLessorNameChange={(val) =>
              setFooterInfo((prev) => ({
                ...prev,
                lessor: { ...prev.lessor, name: val },
              }))
            }
            onLesseeNameChange={(val) =>
              setFooterInfo((prev) => ({
                ...prev,
                lessee: { ...prev.lessee, name: val },
              }))
            }
            leaseType={leaseType as any}
            setLeaseType={setLeaseType as any}
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
            priorityDateOption={priorityConfirmedDateYn === null ? null : priorityConfirmedDateYn ? "exist" : "none"}
            
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
              const valStr = String(value);

              if (field === "unpaidTaxOption") {
                setTaxArrears(valStr === "true" || valStr === "exist");
              }
              if (field === "priorityDateOption") {
                setPriorityConfirmedDateYn(valStr === "true" || valStr === "exist");
              }
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
        </div>

        <ContractFooterSection
          mode={mode}
          footerInfo={footerInfo}
          setFooterInfo={setFooterInfo}
          contractWrittenDate={contractWrittenDate}
          setContractWrittenDate={setContractWrittenDate}
          isReadOnly={isReadOnly}
          isCompleted={isCompleted}
          onSignClick={handleSignClick}
        />

        {!isCompleted && (
          <SignatureModal
            isOpen={signatureModalOpen}
            onClose={() => setSignatureModalOpen(false)}
            onSave={handleSignatureSave}
          />
        )}
      </section>
    );
  }
);

export default Contract;