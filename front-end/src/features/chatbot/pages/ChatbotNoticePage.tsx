import { FC } from "react";

interface ChatbotNoticePageProps {
  onAgree: () => void;
}

const ChatbotNoticePage: FC<ChatbotNoticePageProps> = ({ onAgree }) => {
  return (
    <div className="w-[360px] h-[520px] flex flex-col border border-neutral-light200 rounded-lg bg-neutral-light300 shadow-2xl p-6 justify-center items-center">
      
      <h2 className="text-xl font-bold mb-4 text-neutral-800 flex items-center gap-2">
        <span className="material-symbols-rounded text-neutral-dark200">
          info
        </span>
        AI 챗봇 유의사항
      </h2>

      {/* 약관 내용이 들어가는 하얀색 박스 (스크롤 가능) */}
      <div className="w-full flex-1 bg-white p-4 rounded border border-neutral-200 text-sm text-neutral-600 mb-6 overflow-y-auto leading-relaxed space-y-3">
        <p>
          본 챗봇이 제공하는 정보는 일반적인 부동산 계약 과정의 이해를 돕기 위한
          참고용으로 제공되는 것이며, 법적 구속력을 갖춘 법률적 자문이 아닙니다.
        </p>
        <p>
          본 챗봇의 답변 및 특약 예시는 실제 부동산 계약 상황에서 발생할 수 있는
          모든 법적 분쟁이나 문제에 대한 완전한 해결책이 될 수 없으며,
          정확성이나 신뢰성을 보증하지 않습니다.
        </p>
        <p>
          실제 계약 진행 시 제공된 정보나 특약사항은 반드시 법률 전문가(변호사,
          법무사 등)의 자문 또는 검토를 받은 후 사용하시기 바랍니다.
        </p>
        <p>
          본 챗봇을 통해 얻은 정보를 무분별하게 신뢰하거나 활용하여 발생한 법적
          책임 및 손해에 대해서는 일체 책임지지 않음을 알려드립니다.
        </p>
        <p>
          본 챗봇 사용자는 위 사항을 모두 이해하고 동의한 것으로 간주합니다.
        </p>
      </div>

      <button
        onClick={() => {
          console.log("동의 버튼 클릭됨!");
          onAgree(); // 부모 컴포넌트의 setAgreed(true) 실행
        }}
        className="w-full bg-[#FFD700] text-neutral-900 font-bold py-3.5 rounded-lg shadow-md hover:bg-[#E6C200] transition"
      >
        동의하고 시작하기
      </button>

    </div>
  );
};

export default ChatbotNoticePage;