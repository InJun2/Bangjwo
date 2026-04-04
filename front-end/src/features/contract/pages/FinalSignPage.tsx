import { useRef, useState } from "react";
import Button from "../../../components/buttons/Button";
import HeaderContract from "../../../components/headers/HeaderContract";
import NoticeDefault from "../../../components/notices/NoticeDefault";
import Contract, { ContractRefType } from "../components/Contract";
import { useNavigate, useParams } from "react-router-dom";
import {
  useFinalizeLandlordSignature,
  useFinalizeTenantSignature,
} from "../../../apis/contract";

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const FinalSignPage = () => {
  const contractRef = useRef<ContractRefType>(null);
  const navigate = useNavigate();
  const { contractId } = useParams();

  const currentMode = "lessee";

  const { mutate: finalApproveLandlord, isPending: isLandlordPending } =
    useFinalizeLandlordSignature();
  const { mutate: finalApproveTenant, isPending: isTenantPending } =
    useFinalizeTenantSignature();

  const isPending = isLandlordPending || isTenantPending;

  const handleFinalApprove = () => {
    const signatures = contractRef.current?.getSignatures();

    const finalSigBase64 = signatures?.finalSignature;

    if (!finalSigBase64) {
      alert("하단의 서명란을 클릭하여 서명을 완료해주세요!");
      return;
    }

    const signatureFile = dataURLtoFile(finalSigBase64, "signature.png");
    const formData = new FormData();
    formData.append("contractId", String(contractId));

    if (currentMode === "lessor") {
      formData.append("signature4", signatureFile);

      finalApproveLandlord(formData, {
        onSuccess: () => {
          alert("임대인 최종 서명 및 계약이 완료되었습니다!");
          navigate("/blockchain-loading");
        },
        onError: (err) => {
          console.error("임대인 서명 에러:", err);
          alert("서명 전송에 실패했습니다.");
        },
      });
    } else {
      formData.append("signature", signatureFile);

      finalApproveTenant(formData, {
        onSuccess: () => {
          alert("임차인 최종 서명이 완료되었습니다!");
          navigate("/blockchain-loading");
        },
        onError: (err) => {
          console.error("임차인 서명 에러:", err);
          alert("서명 전송에 실패했습니다.");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderContract title="주택임대차계약서 최종 확인 및 서명" />

      <main className="flex flex-row pt-10 px-4 gap-6">
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <NoticeDefault>
              계약서 작성이 모두 완료되었습니다. <br />
              <span className="text-red-500 font-bold">
                내용은 더 이상 수정할 수 없습니다.
              </span>{" "}
              내용을 꼼꼼히 확인하신 후 하단에 서명해주세요.
            </NoticeDefault>
          </div>

          <Contract
            mode={currentMode}
            isReadOnly={true}
            ref={contractRef}
            contractId={Number(contractId)}
          />

          <div className="flex justify-center gap-6 pt-8 pb-16">
            <Button
              size="medium"
              variant="point"
              onClick={handleFinalApprove}
              disabled={isPending}
            >
              {isPending ? "서명 전송 중..." : "최종 승인 및 서명 완료"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalSignPage;
