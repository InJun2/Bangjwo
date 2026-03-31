import { useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";

const ChatbotNotice = () => {
  const navigate = useNavigate();

  const handleAgree = () => {
    navigate("/chatbot"); // → ChatbotPage로 이동
  };

  return (
  // 1. 화면 전체를 덮는 flex 컨테이너를 만들어서 수평/수직 가운데 정렬을 합니다.
    <div className="w-full min-h-[80vh] flex justify-center items-center p-4">
      
      // 2. 박스 크기를 w-full 대신 고정 너비(예: 400px)로 잡아서 뚱뚱해지지 않게 만듭니다.
      <div className="w-full max-w-[400px] min-h-[520px] bg-neutral-light300 rounded-lg shadow-md p-6 text-neutral-black space-y-5">
        
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="material-symbols-rounded text-lg text-neutral-dark200">
            info
          </span>
          <span>챗봇 유의사항</span>
        </div>

        <div className="space-y-3 text-sm leading-relaxed">
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

        <div className="pt-2 flex justify-center">
          <Button size="medium" variant="point" onClick={handleAgree}>
            동의하고 시작하기
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export default ChatbotNotice;
