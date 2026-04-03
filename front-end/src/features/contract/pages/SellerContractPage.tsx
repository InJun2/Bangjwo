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
import { dataURLtoFile } from "../../../utils/fileUtils";

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

  const createFormData = async (data: UpdateLandlordInfoDto, sigs: any, currentContractId: number) => {
    const formData = new FormData();
    formData.append("contractId", String(currentContractId));

    Object.entries(data).forEach(([key, value]) => {
      if (
        key !== "landlordSignatureUrl1" &&
        key !== "landlordSignatureUrl2" &&
        key !== "landlordSignatureUrl3" &&
        key !== "contractId"
      ) {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, String(v)));
          } else {
            formData.append(key, String(value));
          }
        }
      }
    });

    const appendSignature = async (sigUrl: string | null | undefined, fieldName: string, fileName: string) => {
      if (!sigUrl) return;
      
      if (sigUrl.startsWith("data:image/")) {
        formData.append(fieldName, dataURLtoFile(sigUrl, fileName));
      } else if (sigUrl.startsWith("http")) {
        try {
          const response = await fetch(sigUrl);
          const blob = await response.blob();
          formData.append(fieldName, new File([blob], fileName, { type: blob.type || "image/png" }));
        } catch (e) {
          console.error(`서명 파일 변환 실패 (${fieldName}):`, e);
          alert("기존 서명 이미지를 불러오는 데 실패했습니다. 서명 칸을 다시 클릭하여 서명해주세요.");
          throw e;
        }
      }
    };

    await appendSignature(sigs?.sig1, "landlordSignatureUrl1", "signature1.png");
    await appendSignature(sigs?.sig2, "landlordSignatureUrl2", "signature2.png");
    await appendSignature(sigs?.sig3, "landlordSignatureUrl3", "signature3.png");

    return formData;
  };

  const handleTempSave = async () => {
    const data = contractRef.current?.getFormData() as UpdateLandlordInfoDto;
    const sigs = (contractRef.current as any)?.getSignatures?.();

    if (!data) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    try {
      const formData = await createFormData(data, sigs, Number(contractId));

      saveLandlordInfo(formData, {
        onSuccess: () => {
          alert("임시 저장 및 서명 저장이 완료되었습니다!");
        },
        onError: (err) => {
          alert("저장 중 오류가 발생했습니다.");
          console.error(err);
        },
      });
    } catch (error) {
      // 서명 변환 실패 등
    }
  };

  const handleFinalize = async () => {
    const data = contractRef.current?.getFormData() as UpdateLandlordInfoDto;
    const sigs = (contractRef.current as any)?.getSignatures?.();

    if (!data) {
      alert("제출할 데이터가 없습니다.");
      return;
    }

    if (
      !data.leaseType ||
      !data.contractWrittenDate ||
      !data.leaseStartDate ||
      !data.leaseEndDate ||
      !data.moveInRegistrationDate ||
      !data.contractType ||
      !data.monthlyRentType
    ) {
      alert("필수 입력값이 누락되었습니다.\n헤더의 '임대 유형(월세/전세)' 및 날짜 등을 모두 입력해주세요.");
      return;
    }

    if (!sigs?.sig1 || !sigs?.sig2 || !sigs?.sig3) {
      alert("등록 완료 전, 임대인 서명 3개를 모두 진행해주세요.");
      return;
    }

    try {
      const formData = await createFormData(data, sigs, Number(contractId));

      finalizeContract(formData, {
        onSuccess: () => {
          alert("계약서 등록이 완료되었습니다!");
          navigate('/');
        },
        onError: (error) => {
          alert("계약서 등록 중 오류가 발생했습니다. 모든 필수 항목이 채워졌는지 확인해주세요.");
          console.error(error);
        },
      });
    } catch (error) {
      // 에러 처리
    }
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

          <Contract 
            mode="lessor" 
            ref={contractRef} 
            roomData={roomDetail}
            contractId={Number(contractId)}
          />

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