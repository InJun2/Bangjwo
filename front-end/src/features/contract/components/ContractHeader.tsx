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
  const waGwa =
    lessorName.length >= 2 ? (hasBatchim(lessorName) ? "과" : "와") : "와";
  const eunNeun =
    lesseeName.length >= 2 ? (hasBatchim(lesseeName) ? "은" : "는") : "는";
    lessorName = lessorName.length >= 2 ? lessorName : "하정수";
  leaseType = leaseType === null ? "MONTHLY_WITH_DEPOSIT" : leaseType;


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
          mode={mode} // 또는 "lessee"
          value={leaseType}
          onChange={setLeaseType}
        />
      </div>

      <div className="mt-10 text-base font-medium flex flex-wrap items-center gap-2">
        <span>임대인</span>
        {mode === "lessor" ? (
          <EditableInputBox
            value={lessorName}
            onChange={onLessorNameChange}
            placeholder="하정수"
            minLength={2}
            maxLength={10}
            customWidth="w-[100px]"
          />
        ) : (
          <DisabledInputBox
            value={lessorName}
            placeholder="하정수"
            customWidth="w-[100px]"
          />
        )}
        <span>{waGwa} 임차인</span>
        {mode === "lessee" ? (
          <EditableInputBox
            value={lesseeName}
            onChange={onLesseeNameChange}
            placeholder="성명"
            minLength={2}
            maxLength={10}
            customWidth="w-[100px]"
          />
        ) : (
          <DisabledInputBox
            value={lesseeName}
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
