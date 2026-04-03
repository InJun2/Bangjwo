import { Dispatch, SetStateAction, useState, useEffect } from "react";
import EditableInputBox from "./EditableInputBox";
import DisabledInputBox from "./DisabledInputBox";
import NoticeGray from "../../../components/notices/NoticeGray";
import DatePickerInput from "../components/DatePickerInput";
import { openAddressSearch } from "../../../utils/openAddressSearch";

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

interface ContractFooterSectionProps {
  mode: "lessor" | "lessee";
  footerInfo: FooterState;
  setFooterInfo: Dispatch<SetStateAction<FooterState>>;
  contractWrittenDate: string;
  setContractWrittenDate: Dispatch<SetStateAction<string>>;
}

const ContractFooterSection = ({
  mode,
  footerInfo,
  setFooterInfo,
  contractWrittenDate,
  setContractWrittenDate,
}: ContractFooterSectionProps) => {
  const isLessor = mode === "lessor";
  const isLessee = mode === "lessee";

  const selectedDate = contractWrittenDate
    ? new Date(contractWrittenDate)
    : null;

  const [showLessorSignatureHelp, setShowLessorSignatureHelp] = useState(false);
  const [showLesseeSignatureHelp, setShowLesseeSignatureHelp] = useState(false);

  const handleChange = (
    role: "lessor" | "lessee",
    key: keyof FooterInfo,
    value: string
  ) => {
    setFooterInfo((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: value,
      },
    }));
  };

  const handleAddressSearch = (role: "lessor" | "lessee") => {
    openAddressSearch((data) => {
      handleChange(role, "address", data.roadAddress);
    });
  };

  const renderInputBox = (
    role: "lessor" | "lessee",
    key: keyof FooterInfo,
    placeholder?: string,
    customWidth?: string,
    maxLength?: number
  ) => {
    const editable =
      (role === "lessor" && isLessor) || (role === "lessee" && isLessee);
      
    const value = footerInfo[role][key] || "";

    if (key === "address") {
      return (
        <div
          onClick={() => editable && handleAddressSearch(role)}
          className={editable ? "cursor-pointer w-full" : "w-full"}
        >
          {editable ? (
            <EditableInputBox
              value={value}
              onChange={(val) => handleChange(role, key, val)}
              placeholder="클릭하여 주소 검색"
              customWidth={customWidth}
              disabled={true}
            />
          ) : (
            <DisabledInputBox
              value={value}
              placeholder="주소 정보 없음"
              customWidth={customWidth}
            />
          )}
        </div>
      );
    }

    return editable ? (
      <EditableInputBox
        value={value}
        onChange={(val) => handleChange(role, key, val)}
        placeholder={placeholder}
        customWidth={customWidth}
        maxLength={maxLength}
      />
    ) : (
      <DisabledInputBox
        value={value}
        placeholder={placeholder}
        customWidth={customWidth}
      />
    );
  };

  return (
    <div className="mt-10 text-base leading-relaxed">
      <div className="mt-10 text-base leading-relaxed">
        <p className="mb-6 font-bold">
          본 계약을 증명하기 위하여 임대인, 임차인은 이의 없음을 확인하고 각자
          서명한 후 1통씩 보관한다.
        </p>

        {/* 계약서 작성일 */}
        <div className="flex items-center gap-4 mb-6">
          <span className="w-[60px] font-bold text-lg">날짜</span>
          <div className={isLessor ? "w-[220px]" : "cursor-not-allowed"}>
            <DatePickerInput
              selectedDate={selectedDate}
              onChange={(date) =>
                setContractWrittenDate(
                  date ? date.toISOString().split("T")[0] : ""
                )
              }
              placeholder="계약 날짜 선택"
              disabled={!isLessor}
            />
          </div>
        </div>
      </div>

      {/* 임대인, 임차인 정보 입력 */}
      {["lessor", "lessee"].map((roleKey) => {
        const role = roleKey as "lessor" | "lessee";
        const label = role === "lessor" ? "임대인" : "임차인";
        const editable =
          (role === "lessor" && isLessor) || (role === "lessee" && isLessee);
        
        const showSignatureHelp = role === "lessor" ? showLessorSignatureHelp : showLesseeSignatureHelp;
        const setShowSignatureHelp = role === "lessor" ? setShowLessorSignatureHelp : setShowLesseeSignatureHelp;

        return (
          <div
            key={role}
            className="mt-10 p-6 rounded-lg bg-neutral-light100/30 border border-neutral-light200"
          >
            <div className="flex items-center gap-14 mb-6">
              <span className="w-[60px] font-extrabold text-lg text-neutral-black">
                {label}
              </span>
              <div className="flex items-center gap-4 w-full">
                <span className="w-[100px] font-medium">주소</span>
                {renderInputBox(
                  role,
                  "address",
                  "클릭하여 주소 검색",
                  "w-full"
                )}
              </div>
            </div>

            <div className="ml-[114px] flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">주민등록번호</span>
                {renderInputBox(
                  role,
                  "ssn",
                  "000000-0000000",
                  "w-[300px]",
                  14
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">전화</span>
                {renderInputBox(
                  role,
                  "phone",
                  "010-0000-0000",
                  "w-[300px]",
                  13
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">성명</span>
                {renderInputBox(role, "name", "성명 입력", "w-[160px]")}
              </div>

              {/* 서명란 */}
              <div className="flex items-center gap-4">
                <div className="w-[100px] flex items-center gap-1">
                  <span className="font-medium">서명</span>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => setShowSignatureHelp((prev) => !prev)}
                      className="flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className="material-symbols-rounded text-neutral-dark200"
                        style={{
                          fontVariationSettings: `'FILL' ${
                            showSignatureHelp ? 1 : 0
                          }, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                          fontSize: "20px",
                        }}
                      >
                        help
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[120px] h-[40px] border-2 border-dashed border-neutral-light200 bg-white flex items-center justify-center text-neutral-gray text-xs">
                    최종 확인 후 서명
                  </div>
                  <span className="text-sm font-bold">(인)</span>
                </div>
              </div>

              {showSignatureHelp && (
                <NoticeGray>
                  서명은 모든 계약 내용을 최종적으로 확인한 뒤에 진행해 주세요.
                </NoticeGray>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractFooterSection;