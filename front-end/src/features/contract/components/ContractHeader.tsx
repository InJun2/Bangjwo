import React from "react";
import EditableInputBox from "./EditableInputBox";
import DisabledInputBox from "./DisabledInputBox";
import NoticeDefault from "../../../components/notices/NoticeDefault";
import hasBatchim from "../utils/hasBatchim";
import RentTypeSelector from "./RentTypeSelector";

interface ContractHeaderProps {
  mode: "lessor" | "lessee";
  lessorName: string;
  lesseeName: string;
  onLessorNameChange: (value: string) => void;
  onLesseeNameChange: (value: string) => void;
  leaseType: "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | null;
  setLeaseType: React.Dispatch<
    React.SetStateAction<"MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | null>
  >;
}

const ContractHeader = ({
  mode,
  lessorName,
  lesseeName,
  onLessorNameChange,
  onLesseeNameChange,
  leaseType,
  setLeaseType,
}: ContractHeaderProps) => {
  const safeLessorName = lessorName && lessorName.length >= 2 ? lessorName : "하정수";
  const safeLesseeName = lesseeName && lesseeName.length >= 2 ? lesseeName : "성명";

  const waGwa = hasBatchim(safeLessorName) ? "과" : "와";
  const eunNeun = hasBatchim(safeLesseeName) ? "은" : "는";
  
  const currentLeaseType = leaseType === null ? "MONTHLY_WITH_DEPOSIT" : leaseType;

  return (
    <>
      <div className="flex justify-center w-full">
        <NoticeDefault>
          이 계약서는 법무부에서 제공하는 주택임대차표준계약서를 중개인 항목을
          제외하여 재구성했어요.
          <br />
          법의 보호를 받기 위해 계약서 하단의 중요확인사항을 꼭 확인해주세요.
        </NoticeDefault>
      </div>

      <h2 className="mt-10 text-2xl font-extrabold text-center">
        주택임대차계약서
      </h2>

      <div className="mt-6 flex justify-end gap-6 items-center">
        <span className="text-base font-bold whitespace-nowrap"></span>
        <RentTypeSelector
          mode={mode}
          value={currentLeaseType}
          onChange={setLeaseType}
        />
      </div>

      <div className="mt-10 text-base font-medium flex flex-wrap items-center gap-2">
        <span>임대인</span>
        {mode === "lessor" ? (
          <EditableInputBox
            value={lessorName} // 실제 데이터 바인딩
            onChange={onLessorNameChange}
            placeholder="성명"
            minLength={2}
            maxLength={10}
            customWidth="w-[100px]"
          />
        ) : (
          <DisabledInputBox
            value={safeLessorName}
            placeholder="성명"
            customWidth="w-[100px]"
          />
        )}
        <span>{waGwa} 임차인</span>
        {mode === "lessee" ? (
          <EditableInputBox
            value={lesseeName} // 실제 데이터 바인딩
            onChange={onLesseeNameChange}
            placeholder="성명"
            minLength={2}
            maxLength={10}
            customWidth="w-[100px]"
          />
        ) : (
          <DisabledInputBox
            value={safeLesseeName}
            placeholder="성명"
            customWidth="w-[100px]"
          />
        )}
        <span>{eunNeun} 아래와 같이 임대차 계약을 체결한다.</span>
      </div>
    </>
  );
};

export default ContractHeader;