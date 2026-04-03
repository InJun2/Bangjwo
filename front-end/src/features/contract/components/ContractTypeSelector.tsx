import { useState } from "react";
import EditableInputBox from "./EditableInputBox";
import DisabledInputBox from "./DisabledInputBox";

interface ContractTypeSelectorProps {
  mode: "lessor" | "lessee";
  contractType: string | null; // 🚀 부모에서 넘어오는 상태 (null 허용)
  setContractType: (value: string) => void;
}

const ContractTypeSelector = ({
  mode,
  contractType, // 🚀 부모의 상태를 그대로 씁니다! (내부 useState 삭제)
  setContractType,
}: ContractTypeSelectorProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");

  const isLessee = mode === "lessee";

  const contractOptions = [
    { label: "신규 계약", value: "NEW" },
    { label: "합의에 의한 재계약", value: "RENEW_BY_AGREEMENT" },
    {
      label: "주택임대차보호법 제6조의3의 계약갱신요구권 행사에 의한 갱신계약",
      value: "EXTENSION",
    },
  ];

  return (
    <div
      className={`border-3 p-4 rounded-sm w-fit flex flex-col gap-3 transition-colors ${
        isLessee
          ? "bg-neutral-light200 border-neutral-light100"
          : !contractType
          ? "bg-white border-green"
          : "bg-white border-neutral-gray"
      }`}
    >
      <fieldset className="flex flex-col gap-3">
        {contractOptions.map((option) => (
          <label
            key={option.value}
            className={`flex flex-col text-sm font-bold ${
              isLessee
                ? "cursor-not-allowed text-neutral-black"
                : "cursor-pointer"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="contractType"
                value={option.value}
                checked={contractType === option.value}
                onChange={() => {
                  if (!isLessee) {
                    setContractType(option.value);
                  }
                }}
                disabled={isLessee}
                className="w-[16px] h-[16px] border-2 border-neutral-dark200 bg-white appearance-none rounded-none transition-colors checked:bg-neutral-dark200 disabled:cursor-not-allowed"
              />
              {option.label}
            </span>

            {contractType === "EXTENSION" && option.value === "EXTENSION" && (
              <div className="mt-3 flex flex-col gap-3 pl-6">
                <h4 className="text-sm font-bold">
                  갱신 전 임대차계약 기간 및 금액
                </h4>

                {/* 계약 기간 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">계약 기간</span>
                  {isLessee ? (
                    <DisabledInputBox value={startDate} placeholder="YYYY.MM.DD" customWidth="w-[140px]" />
                  ) : (
                    <EditableInputBox value={startDate} onChange={setStartDate} placeholder="YYYY.MM.DD" customWidth="w-[140px]" />
                  )}
                  <span className="text-sm">부터</span>
                  {isLessee ? (
                    <DisabledInputBox value={endDate} placeholder="YYYY.MM.DD" customWidth="w-[140px]" />
                  ) : (
                    <EditableInputBox value={endDate} onChange={setEndDate} placeholder="YYYY.MM.DD" customWidth="w-[140px]" />
                  )}
                  <span className="text-sm">까지</span>
                </div>

                {/* 보증금 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">보증금</span>
                  {isLessee ? (
                    <DisabledInputBox value={deposit} placeholder="0" customWidth="w-[160px]" />
                  ) : (
                    <EditableInputBox value={deposit} onChange={setDeposit} placeholder="0" customWidth="w-[160px]" />
                  )}
                  <span className="text-sm">원</span>
                </div>

                {/* 차임 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">차임 월</span>
                  {isLessee ? (
                    <DisabledInputBox value={monthlyRent} placeholder="0" customWidth="w-[160px]" />
                  ) : (
                    <EditableInputBox value={monthlyRent} onChange={setMonthlyRent} placeholder="0" customWidth="w-[160px]" />
                  )}
                  <span className="text-sm">원</span>
                </div>
              </div>
            )}
          </label>
        ))}
      </fieldset>
    </div>
  );
};

export default ContractTypeSelector;