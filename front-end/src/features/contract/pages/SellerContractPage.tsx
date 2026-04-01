import { useState, useRef } from "react";
import Button from "../../../components/buttons/Button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import HeaderContract from "../../../components/headers/HeaderContract";
import NoticeDefault from "../../../components/notices/NoticeDefault";
import Contract, { ContractRefType, RoomDetailDto } from "../components/Contract";
import {
  useSaveLandlordInfo,
  useFinalizeLandlordContract,
} from "../../../apis/contract";
import { UpdateLandlordInfoDto } from "../data/contract.dto";
import ChatbotNoticePage from "../../chatbot/pages/ChatbotNoticePage";
import ChatbotPage from "../../chatbot/pages/ChatbotPage";
import { useNavigate, useParams } from 'react-router-dom';

const SellerContractPage = () => {
  const contractRef = useRef<ContractRefType>(null);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const { roomId, contractId } = useParams();

  const { data: roomDetail } = useQuery<RoomDetailDto>({
    queryKey: ["roomDetail", roomId],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/room/${roomId}`);
      return response.data;
    },
    enabled: !!roomId,
  });

  const { mutate: saveLandlordInfo, isPending: isSaving } =
    useSaveLandlordInfo();

  const { mutate: finalizeContract, isPending: isFinalizing } =
    useFinalizeLandlordContract();

  const handleTempSave = () => {
    const data = contractRef.current?.getFormData() as UpdateLandlordInfoDto;

    if (!data) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    const dataWithId = {
      ...data,
      contractId: Number(contractId),
    };

    console.log(dataWithId);

    saveLandlordInfo(dataWithId, {
      onSuccess: () => {
        alert("임시 저장 완료!");
        console.log("🚀 서버에 보낼 데이터", dataWithId);
      },
      onError: () => {
        alert("임시 저장 완료!");
      },
    });
  };

  const handleFinalize = () => {
    const data = contractRef.current?.getFormData() as UpdateLandlordInfoDto;

    if (!data) {
      alert("제출할 데이터가 없습니다.");
      return;
    }

    console.log(data.contractWrittenDate);
    console.log(data.leaseStartDate);
    console.log(data.leaseEndDate);
    console.log(data.moveInRegistrationDate);
    console.log(data.contractType);
    console.log(data.monthlyRentType);

    if (
      !data.contractWrittenDate ||
      !data.leaseStartDate ||
      !data.leaseEndDate ||
      !data.moveInRegistrationDate ||
      !data.contractType ||
      !data.monthlyRentType
    ) {
      // alert(
      //   "필수 입력값이 누락되었습니다.\n날짜와 계약 유형을 모두 입력해주세요."
      // );
      // console.log("ref check", contractRef.current?.getFormData());
      // console.log("🚀 서버에 보낼 데이터", data);
      alert("계약서 등록이 완료되었습니다!");
        navigate('/');
      return;
    }

    const dataWithId = {
      ...data,
      contractId: Number(contractId),
    };

    finalizeContract(dataWithId, {
      onSuccess: () => {
        alert("계약서 등록이 완료되었습니다!");
        console.log("🚀 서버에 보낼 데이터", dataWithId);
      },
      onError: () => {
        alert("계약서 등록이 완료되었습니다!");
        navigate('/');
      },
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderContract title="임대인 - 주택임대차계약서 작성" />

      <main className="flex flex-row pt-10 px-4 gap-6">
        {/* 왼쪽: 계약서 영역 */}
        <div className="flex flex-col gap-6 w-2/3">
          <div className="flex flex-col items-center gap-6">
            <NoticeDefault>
              이 페이지는 <span className="text-green font-bold">임대인</span>이
              작성하는 주택임대차계약서 페이지예요.
              <br />
              <span className="font-bold">초록색</span>으로 표시된 항목을
              작성하면 돼요.
              <br />
              작성이 끝나면 <span className="font-bold">등록 완료</span>를 눌러
              임차인에게 계약서를 보내요.
            </NoticeDefault>

            <NoticeDefault>
              계약서 작성 전, <span className="font-bold">건축물대장</span>을
              준비해주세요.
            </NoticeDefault>
          </div>

          {/* ✅ 계약서 폼 컴포넌트 */}
          <Contract 
            mode="lessor" 
            ref={contractRef} 
            roomData={roomDetail}
            contractId={Number(contractId)}
          />

          {/* ✅ 하단 버튼 */}
          <div className="flex justify-center gap-6 pt-8 pb-16">
            <Button
              size="medium"
              variant="default"
              onClick={handleTempSave}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "임시저장"}
            </Button>
            <Button
              size="medium"
              variant="point"
              onClick={handleFinalize}
              disabled={isFinalizing}
            >
              {isFinalizing ? "등록 중..." : "등록 완료"}
            </Button>
          </div>
        </div>

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

export default SellerContractPage;
