import { useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

import Button from "../../../components/buttons/Button";
import HeaderContract from "../../../components/headers/HeaderContract";
import NoticeDefault from "../../../components/notices/NoticeDefault";
import Contract, { ContractRefType } from "../components/Contract";
import { useFinalizeLandlordSignature, useFinalizeTenantSignature } from "../../../apis/contract";

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
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
  const captureRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { contractId } = useParams();
  const location = useLocation();

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const roleFromState = location.state?.role;
  const statusFromState = location.state?.status;

  const currentMode = roleFromState === "LANDLORD" ? "lessor" : "lessee";
  const isCompleted = statusFromState === "COMPLETED";

  const { mutate: finalApproveLandlord, isPending: isLandlordPending } = useFinalizeLandlordSignature();
  const { mutate: finalApproveTenant, isPending: isTenantPending } = useFinalizeTenantSignature();

  const isPending = isLandlordPending || isTenantPending || isPdfGenerating;

  const handleFinalApprove = async () => {
    const signatures = contractRef.current?.getSignatures();
    const finalSigBase64 = signatures?.finalSignature;

    if (!finalSigBase64) {
      alert("하단의 서명란을 클릭하여 서명을 완료해주세요!");
      return;
    }

    try {
      setIsPdfGenerating(true);
      const signatureFile = dataURLtoFile(finalSigBase64, "signature.jpeg");
      const formData = new FormData();
      formData.append("contractId", String(contractId));

      if (currentMode === "lessor") {
        formData.append("signature4", signatureFile);

        if (captureRef.current) {
          const imgData = await toJpeg(captureRef.current, { 
            quality: 0.8, 
            pixelRatio: 1.5, 
            backgroundColor: '#ffffff',
            skipFonts: true,
            filter: (node: HTMLElement) => {
              if (node.tagName === 'LINK' && (node as HTMLLinkElement).href.includes('fonts.googleapis.com')) {
                return false;
              }
              return true;
            }
          });
          
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfPageHeight = pdf.internal.pageSize.getHeight();

          const elWidth = captureRef.current.offsetWidth;
          const elHeight = captureRef.current.offsetHeight;
          const totalPdfHeight = (elHeight * pdfWidth) / elWidth;

          let heightLeft = totalPdfHeight;
          let position = 0;

          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
          heightLeft -= pdfPageHeight;

          while (heightLeft > 0) {
            position -= pdfPageHeight;
            pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, totalPdfHeight);
            heightLeft -= pdfPageHeight;
          }
          
          const pdfBlob = pdf.output("blob");
          const pdfFile = new File([pdfBlob], `contract_${contractId}.pdf`, { type: "application/pdf" });
          
          formData.append("pdfFile", pdfFile); 
        }

        finalApproveLandlord(formData, {
          onSuccess: () => {
            alert("임대인 최종 서명 및 계약이 완료되었습니다!");
            navigate("/blockchain-loading");
          },
          onError: () => {
            alert("서명 전송에 실패했습니다.");
          },
        });
      } else {
        // 임차인은 기존 로직 유지
        formData.append("signature", signatureFile);
        finalApproveTenant(formData, {
          onSuccess: () => {
            alert("임차인 최종 서명이 완료되었습니다!");
            navigate("/mypage/contract");
          },
          onError: () => {
            alert("서명 전송에 실패했습니다.");
          },
        });
      }
    } catch (error) {
      console.error("PDF 생성 에러:", error);
      alert("문서 처리 중 오류가 발생했습니다.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderContract title={isCompleted ? "주택임대차계약서 조회" : "주택임대차계약서 최종 확인 및 서명"} />

      <main className="flex flex-row pt-10 px-4 gap-6">
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {!isCompleted ? (
            <div className="flex flex-col items-center gap-6">
              <NoticeDefault>
                계약서 작성이 모두 완료되었습니다. <br />
                <span className="text-red-500 font-bold">내용은 더 이상 수정할 수 없습니다.</span> 내용을 꼼꼼히 확인하신 후 하단에 서명해주세요.
              </NoticeDefault>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <NoticeDefault>
                완료된 계약서입니다. <br />
                내용과 서명을 확인하실 수 있습니다.
              </NoticeDefault>
            </div>
          )}

          <div ref={captureRef} className="bg-white pb-10">
            <Contract
              mode={currentMode}
              isReadOnly={true}
              isCompleted={isCompleted}
              ref={contractRef}
              contractId={Number(contractId)}
            />
          </div>

          <div className="flex justify-center gap-6 pt-8 pb-16">
            {isCompleted ? (
              <Button size="medium" variant="point" onClick={() => navigate("/mypage/contract")}>
                마이페이지로 돌아가기
              </Button>
            ) : (
              <Button size="medium" variant="point" onClick={handleFinalApprove} disabled={isPending}>
                {isPdfGenerating ? "계약서 변환 중..." : isPending ? "서명 전송 중..." : "최종 승인 및 서명 완료"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalSignPage;