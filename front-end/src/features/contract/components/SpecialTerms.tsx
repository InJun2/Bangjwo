import { useState } from "react";
import EditableInputBox from "./EditableInputBox";
import DisabledInputBox from "./DisabledInputBox";
import Button from "../../../components/buttons/Button";
import DatePickerInput from "./DatePickerInput";

interface SpecialTermsProps {
  mode: "lessor" | "lessee";
  moveInRegistrationDate: Date | null;
  setMoveInRegistrationDate: (date: Date | null) => void;
  unpaidAmount: number;
  setUnpaidAmount: (value: number) => void;
  disputeResolution: boolean;
  setDisputeResolution: (value: boolean) => void;
  isHousingReconstructionPlanned: boolean;
  setIsHousingReconstructionPlanned: (value: boolean) => void;
  constructionPeriod: string;
  setConstructionPeriod2: (value: string) => void;
  estimatedConstructionDuration: number;
  setEstimatedConstructionDuration: (value: number) => void;
  isDetailedAddressConsentGiven: boolean;
  setIsDetailedAddressConsentGiven: (value: boolean) => void;
  etc: string[];
  setEtc: (value: string[]) => void;
}

const SpecialTerms = ({
  mode,
  setMoveInRegistrationDate,
  setUnpaidAmount,
  setDisputeResolution,
  setIsHousingReconstructionPlanned,
  setConstructionPeriod2,
  setEstimatedConstructionDuration,
  setIsDetailedAddressConsentGiven,
  etc,
  setEtc
}: SpecialTermsProps) => {
  const isEditable = mode === "lessor";

  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [taxAmount, setTaxAmount] = useState("");
  const [disputeConsent, setDisputeConsent] = useState<
    "agree" | "disagree" | null
  >(null);
  const [rebuildPlan, setRebuildPlan] = useState<"none" | "exist" | null>(null);
  const [constructionPeriod, setConstructionPeriod] = useState("");
  const [constructionDuration, setConstructionDuration] = useState("");
  const [ownerConsent, setOwnerConsent] = useState<"agree" | "disagree" | null>(
    null
  );

  const [customTerms, setCustomTerms] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState("");

  const handleTax = (data: string) => {
    setTaxAmount(data);
    setUnpaidAmount(Number(data));
  };

  const handleDuration = (data: string) => {
    setConstructionDuration(data);
    setEstimatedConstructionDuration(Number(data));
  };

  const handlePeriod = (data: string) => {
    setConstructionPeriod(data);
    setConstructionPeriod2(data);
  }

  const handleAddNewTerm = () => {
    const trimmedTerm = newTerm.trim();
    if (trimmedTerm) {
      setCustomTerms((prev) => [...prev, trimmedTerm]);
      setEtc([...etc, trimmedTerm]);
      setNewTerm("");
      setIsAdding(false);
    }
  };

  const handleDeleteTerm = (index: number) => {
    setCustomTerms((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-10 text-base font-normal leading-relaxed">
      <h3 className="text-lg font-extrabold mb-4">[특약사항]</h3>
      <ul className="flex flex-col gap-4">
        <li>
          • 주택을 인도받은 임차인은{" "}
          <span className="inline-flex mx-2 align-middle">
            <DatePickerInput
              selectedDate={moveInDate}
              onChange={(date) => {
                setMoveInDate(date);
                setMoveInRegistrationDate(date);
              }}
              placeholder="날짜"
              disabled={!isEditable}
            />
          </span>
          까지 주민등록(전입신고)과 주택임대차계약서상 확정일자를 받기로 하고,
          임대인은 위 약정일자의 다음날까지 임차주택에 저당권 등 담보권을 설정할
          수 없다.
        </li>

        <li>
          • 임대인이 위 특약에 위반하여 임차주택에 저당권 등 담보권을 설정한
          경우에는 임차인은 임대차계약을 해제 또는 해지할 수 있으며, 이 경우
          임대인은 임차인에게 위 특약 위반으로 인한 손해를 배상하여야 한다.
        </li>

        <li>
          • 임대차계약을 체결한 임차인은 계약 시 기준으로 임대인이 고지하지 않은
          선순위 임대차 정보 또는 체납 세금이{" "}
          <span className="inline-flex mx-2 align-middle">
            {isEditable ? (
              <EditableInputBox
                value={taxAmount}
                onChange={handleTax}
                placeholder="금액"
                customWidth="w-[120px]"
                disabled={false}
              />
            ) : (
              <DisabledInputBox
                value={taxAmount}
                placeholder="금액"
                customWidth="w-[120px]"
              />
            )}
          </span>
          원을 초과할 경우, 계약 해제가 가능하다.
        </li>

        <li>
          • 주택 임대차 계약과 관련한 분쟁이 있는 경우 먼저 분쟁조정위원회에
          조정을 신청한다.
          <div
            className={`mt-2 px-4 py-3 rounded-sm border-3 flex gap-4 w-fit ${
              !isEditable
                ? "bg-neutral-light200 border-neutral-light100"
                : disputeConsent === null
                ? "border-green"
                : "border-neutral-gray"
            }`}
          >
            {["agree", "disagree"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 text-sm font-bold ${
                  isEditable ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="disputeConsent"
                  value={option}
                  checked={disputeConsent === option}
                  onChange={() =>{
                    isEditable
                    setDisputeConsent(option as "agree" | "disagree")
                    setDisputeResolution(option == "agree");
                  }
                  }
                  disabled={!isEditable}
                  className="w-[16px] h-[16px] appearance-none border-2 border-neutral-dark200 bg-white checked:bg-neutral-dark200 transition-colors"
                />
                {option === "agree" ? "동의" : "미동의"}
              </label>
            ))}
          </div>
        </li>

        <li>
          • 주택의 철거 또는 재건축에 대한 계획
          <div
            className={`mt-2 px-4 py-3 rounded-sm border-3 flex gap-4 flex-wrap items-center w-fit ${
              !isEditable
                ? "bg-neutral-light200 border-neutral-light100"
                : rebuildPlan === null
                ? "border-green"
                : "border-neutral-gray"
            }`}
          >
            {["none", "exist"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 text-sm font-bold ${
                  isEditable ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="rebuildPlan"
                  value={option}
                  checked={rebuildPlan === option}
                  onChange={() =>{
                    isEditable && setRebuildPlan(option as "none" | "exist")
                    setIsHousingReconstructionPlanned(option == "exist")
                  }
                  }
                  disabled={!isEditable}
                  className="w-[16px] h-[16px] appearance-none border-2 border-neutral-dark200 bg-white checked:bg-neutral-dark200 transition-colors"
                />
                {option === "none" ? (
                  "없음"
                ) : (
                  <>
                    있음 (공사시기:
                    {isEditable ? (
                      <EditableInputBox
                        value={constructionPeriod}
                        onChange={
                          handlePeriod
                        }
                        placeholder="예: 2025.06"
                        customWidth="w-[120px] mx-1"
                        disabled={!isEditable}
                      />
                    ) : (
                      <DisabledInputBox
                        value={constructionPeriod}
                        placeholder="예: 2025.06"
                        customWidth="w-[120px] mx-1"
                      />
                    )}
                    , 소요기간:
                    {isEditable ? (
                      <EditableInputBox
                        value={constructionDuration}
                        onChange={handleDuration}
                        placeholder="개월"
                        customWidth="w-[80px] mx-1"
                        disabled={!isEditable}
                      />
                    ) : (
                      <DisabledInputBox
                        value={constructionDuration}
                        placeholder="개월"
                        customWidth="w-[80px] mx-1"
                      />
                    )}
                    )
                  </>
                )}
              </label>
            ))}
          </div>
        </li>

        <li>
          • 상세주소가 없는 경우 소유자의 동의 여부
          <div
            className={`mt-2 px-4 py-3 rounded-sm border-3 flex gap-4 w-fit ${
              !isEditable
                ? "bg-neutral-light200 border-neutral-light100"
                : ownerConsent === null
                ? "border-green"
                : "border-neutral-gray"
            }`}
          >
            {["agree", "disagree"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 text-sm font-bold ${
                  isEditable ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="ownerConsent"
                  value={option}
                  checked={ownerConsent === option}
                  onChange={() => {
                    isEditable &&
                    setOwnerConsent(option as "agree" | "disagree")
                    setIsDetailedAddressConsentGiven(option == "agree")
                  }
                  }
                  disabled={!isEditable}
                  className="w-[16px] h-[16px] appearance-none border-2 border-neutral-dark200 bg-white checked:bg-neutral-dark200 transition-colors"
                />
                {option === "agree" ? "동의" : "미동의"}
              </label>
            ))}
          </div>
        </li>

        {customTerms.map((term, idx) => (
          <li key={idx} className="relative pr-10">
            <p className="whitespace-pre-wrap break-words pr-2">• {term}</p>
            {isEditable && (
              <button
                onClick={() => handleDeleteTerm(idx)}
                className="absolute top-0 right-0 text-[13px] text-coral-red font-medium mt-0.5 cursor-pointer"
              >
                삭제
              </button>
            )}
          </li>
        ))}

        {isAdding && isEditable && (
          <li className="flex flex-col gap-2">
            <EditableInputBox
              value={newTerm}
              onChange={setNewTerm}
              placeholder="추가할 특약사항을 입력하세요"
              customWidth="w-full"
              maxLength={300}
            />
            <Button size="small" variant="default" onClick={handleAddNewTerm}>
              확인
            </Button>
          </li>
        )}
      </ul>

      {isEditable && !isAdding && (
        <div className="mt-4">
          <Button
            size="small"
            variant="default"
            onClick={() => setIsAdding(true)}
          >
            추가하기
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpecialTerms;
