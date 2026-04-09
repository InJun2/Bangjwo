import { Dispatch, SetStateAction, useState } from "react";
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
  moveInDate?: string;
  signatureUrl?: string; 
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
  isReadOnly?: boolean;
  isCompleted?: boolean;
  onSignClick?: (role: "lessor" | "lessee") => void;
}

const ContractFooterSection = ({
  mode,
  footerInfo,
  setFooterInfo,
  contractWrittenDate,
  setContractWrittenDate,
  isReadOnly = false,
  isCompleted = false,
  onSignClick,
}: ContractFooterSectionProps) => {
  const isLessor = mode === "lessor";
  const isLessee = mode === "lessee";

  const selectedDate = contractWrittenDate ? new Date(contractWrittenDate) : null;
  const [showLessorSignatureHelp, setShowLessorSignatureHelp] = useState(false);
  const [showLesseeSignatureHelp, setShowLesseeSignatureHelp] = useState(false);

  const isContractDateEditable = !isCompleted && !isReadOnly && isLessor;

  const handleChange = (role: "lessor" | "lessee", key: keyof FooterInfo, value: string) => {
    setFooterInfo((prev) => ({ ...prev, [role]: { ...prev[role], [key]: value } }));
  };

  const handleAddressSearch = (role: "lessor" | "lessee") => {
    openAddressSearch((data) => { handleChange(role, "address", data.roadAddress); });
  };

  const renderInputBox = (role: "lessor" | "lessee", key: keyof FooterInfo, placeholder?: string, customWidth?: string, maxLength?: number) => {
    const inputEditable = !isCompleted && !isReadOnly && ((role === "lessor" && isLessor) || (role === "lessee" && isLessee));
    const value = footerInfo[role][key] || "";

    if (key === "address") {
      return (
        <div onClick={() => inputEditable && handleAddressSearch(role)} className={inputEditable ? "cursor-pointer w-full" : "w-full"}>
          {inputEditable ? (
            <EditableInputBox value={value} onChange={(val) => handleChange(role, key, val)} placeholder="클릭하여 주소 검색" customWidth={customWidth} disabled={true} />
          ) : (
            <DisabledInputBox value={value} placeholder="주소 정보 없음" customWidth={customWidth} />
          )}
        </div>
      );
    }
    return inputEditable ? (
      <EditableInputBox value={value} onChange={(val) => handleChange(role, key, val)} placeholder={placeholder} customWidth={customWidth} maxLength={maxLength} />
    ) : (
      <DisabledInputBox value={value} placeholder={placeholder} customWidth={customWidth} />
    );
  };

  return (
    <div className="mt-10 text-base leading-relaxed">
      <div className="mt-10 text-base leading-relaxed">
        <p className="mb-6 font-bold">
          본 계약을 증명하기 위하여 임대인, 임차인은 이의 없음을 확인하고 각자 서명한 후 1통씩 보관한다.
        </p>

        <div className="flex items-center gap-4 mb-6">
          <span className="w-[60px] font-bold text-lg">날짜</span>
          <div className={isContractDateEditable ? "w-[220px]" : "cursor-not-allowed"}>
            <DatePickerInput selectedDate={selectedDate} onChange={(date) => setContractWrittenDate(date ? date.toISOString().split("T")[0] : "")} placeholder="계약 날짜 선택" disabled={!isContractDateEditable} />
          </div>
        </div>
      </div>

      {["lessor", "lessee"].map((roleKey) => {
        const role = roleKey as "lessor" | "lessee";
        const label = role === "lessor" ? "임대인" : "임차인";
        const inputEditable = !isCompleted && !isReadOnly && ((role === "lessor" && isLessor) || (role === "lessee" && isLessee));
        
        // 🚀 가장 중요한 수정: isReadOnly가 true(최종 서명 페이지)일 때만 서명이 가능하도록 원천 봉쇄!
        const signatureEditable = !isCompleted && isReadOnly && ((role === "lessor" && isLessor) || (role === "lessee" && isLessee));
        
        const showSignatureHelp = role === "lessor" ? showLessorSignatureHelp : showLesseeSignatureHelp;
        const setShowSignatureHelp = role === "lessor" ? setShowLessorSignatureHelp : setShowLesseeSignatureHelp;
        
        const signatureUrl = footerInfo[role].signatureUrl;

        return (
          <div key={role} className="mt-10 p-6 rounded-lg bg-neutral-light100/30 border border-neutral-light200">
            <div className="flex items-center gap-14 mb-6">
              <span className="w-[60px] font-extrabold text-lg text-neutral-black">{label}</span>
              <div className="flex items-center gap-4 w-full">
                <span className="w-[100px] font-medium">주소</span>
                {renderInputBox(role, "address", "클릭하여 주소 검색", "w-full")}
              </div>
            </div>

            <div className="ml-[114px] flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">주민등록번호</span>
                {renderInputBox(role, "ssn", "000000-0000000", "w-[300px]", 14)}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">전화</span>
                {renderInputBox(role, "phone", "010-0000-0000", "w-[300px]", 13)}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-[100px] font-medium">성명</span>
                {renderInputBox(role, "name", "성명 입력", "w-[160px]")}
              </div>

              {role === "lessee" && (
                <div className="flex items-center gap-4">
                  <span className="w-[100px] font-medium">입주일</span>
                  <div className={inputEditable ? "w-[220px]" : "cursor-not-allowed"}>
                    <DatePickerInput selectedDate={footerInfo.lessee.moveInDate ? new Date(footerInfo.lessee.moveInDate) : null} onChange={(date) => handleChange(role, "moveInDate", date ? date.toISOString().split("T")[0] : "")} placeholder="입주일 선택" disabled={!inputEditable} />
                  </div>
                </div>
              )}

              {/* 서명란 */}
              <div className="flex items-center gap-4">
                <div className="w-[100px] flex items-center gap-1">
                  <span className="font-medium">서명</span>
                  {signatureEditable && (
                    <button type="button" onClick={() => setShowSignatureHelp((prev) => !prev)} className="flex items-center justify-center cursor-pointer">
                      <span className="material-symbols-rounded text-neutral-dark200" style={{ fontVariationSettings: `'FILL' ${showSignatureHelp ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, fontSize: "20px" }}>help</span>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    onClick={() => { if (signatureEditable && onSignClick) onSignClick(role); }}
                    className={`w-[120px] h-[40px] border-2 border-dashed flex items-center justify-center text-xs overflow-hidden
                      ${!signatureEditable 
                          ? "border-neutral-light200 bg-neutral-light50 text-neutral-gray cursor-not-allowed" 
                          : "border-neutral-light200 bg-white cursor-pointer hover:bg-neutral-light100 text-neutral-black font-bold"}`}
                  >
                    {signatureUrl ? (
                      <img src={signatureUrl} crossOrigin="anonymous" alt="서명 이미지" className="w-full h-full object-contain" />
                    ) : (
                      signatureEditable ? "최종 확인 후 서명" : "서명 불가 (최종 단계용)"
                    )}
                  </div>
                  <span className="text-sm font-bold">(인)</span>
                </div>
              </div>

              {showSignatureHelp && (
                <NoticeGray>서명은 모든 계약 내용을 최종적으로 확인한 뒤에 진행해 주세요.</NoticeGray>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractFooterSection;