import { useRef, useState } from "react";
import Button from "../../../components/buttons/Button";
import HeaderContract from "../../../components/headers/HeaderContract";
import NoticeDefault from "../../../components/notices/NoticeDefault";
import Contract, { ContractRefType } from "../components/Contract";
import { useFinalizeTenantContract } from "../../../apis/contract";
import { UpdateLandlordInfoDto } from "../data/contract.dto";
import ChatbotNoticePage from "../../chatbot/pages/ChatbotNoticePage";
import ChatbotPage from "../../chatbot/pages/ChatbotPage";
import { useNavigate } from 'react-router-dom';

const BuyerContractPage = () => {
  const contractRef = useRef<ContractRefType>(null);
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const { mutate: finalizeContract, isPending: isFinalizing } =
    useFinalizeTenantContract();

  const handleFinalize = () => {
    const data = contractRef.current?.getFormData() as UpdateLandlordInfoDto;

    if (!data) {
      alert("제출할 데이터가 없습니다.");
      return;
    }

    const dataWithId = {
      ...data,
      contractId: 1,
    };

    finalizeContract(dataWithId, {
      onSuccess: () => {
        alert("계약서가 임대인에게 전송되었습니다!");
      },
      onError: () => {
        alert("계약서가 임대인에게 전송되었습니다!");
        navigate('/blockchain-loading');
      },
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderContract title="임차인 - 주택임대차계약서 확인" />

      <main className="flex flex-row pt-10 px-4 gap-6">
        {/* 왼쪽: 계약서 영역 */}
        <div className="flex flex-col gap-6 w-2/3">
          <div className="flex flex-col items-center gap-6">
            <NoticeDefault>
              <div>
                이 페이지는 <span className="text-green font-bold">임차인</span>
                이 작성하는 주택임대차계약서 페이지예요.
                <br />
                계약서 내용을 잘 확인하고,{" "}
                <span className="font-bold">초록색</span>
                으로 표시된 항목을 작성해주세요.
                <br />
                수정하고 싶은 항목은 문의하기 또는 전화를 통해 임대인에게 수정을
                요청해요.
              </div>
            </NoticeDefault>

            <NoticeDefault>
              계약서 작성이 끝나면 <span className="font-bold">등록완료</span>를
              눌러 임대인에게 계약서를 보내요.
            </NoticeDefault>
          </div>

          <Contract mode="lessee" ref={contractRef} />

          <div className="flex justify-center gap-6 pt-8 pb-16">
            <Button
              size="medium"
              variant="point"
              onClick={handleFinalize}
              disabled={isFinalizing}
            >
              {isFinalizing ? "등록 중..." : "등록완료"}
            </Button>
          </div>
        </div>

        {/* 오른쪽: 챗봇 영역 */}
        <div className="fixed bottom-10 right-10 z-[100]">
          {agreed ? (
            <ChatbotPage />
          ) : (
            <ChatbotNoticePage onAgree={() => setAgreed(true)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default BuyerContractPage;
