import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstances";
import Button from "../../../components/buttons/Button";
import InfoText from "../../../components/InfoText";
import TitleBox from "../../../components/TitleBox";
import { useAuth } from "../../../contexts/AuthContext";
import Toast from "../../toast/components/Toast";
import { runIdentityVerification } from "../../verify/utils/verify";
import { useNavigate, useParams } from "react-router-dom";
import ModalAlert from "../../modal/pages/ModalAlert";
import useModal from "../../modal/hooks/useModal";
import { getMyProfile } from "../../mypage/account/services/accountService";
import { preparePayment, validatePayment } from "../../../apis/pay";

const VerifyOwner = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [memberId, setMemberId] = useState<number | undefined>(undefined);
  const { roomId } = useParams();
  const roomIdNumber = roomId ? parseInt(roomId, 10) : undefined;
  const [toastMessage, setToastMessage] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isCertificateVerified, setIsCertificateVerified] = useState(false);

  const [impScriptLoaded, setImpScriptLoaded] = useState<boolean>(false);
  const [validateResult, setValidateResult] = useState<any>(null);

  const [paymentParams, setPaymentParams] = useState({
    merchant_uid: "",
    name: "",
    amount: 0,
    buyer_email: "",
    buyer_name: "",
    buyer_tel: "",
    buyer_addr: "",
    buyer_postcode: "",
  });

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setMemberId(data.id);
    } catch (err) {
      console.error("프로필 정보 불러오기 실패", err);
    }
  };

  // Load 아임포트 Script
  useEffect(() => {
    fetchProfile();
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.async = true;
    script.onload = () => setImpScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePaymentSubmit = async () => {
    if (!isPhoneVerified) {
      setToastMessage(
        "본인 확인이 완료되지 않았습니다. 결제를 진행할 수 없습니다."
      );
      return;
    }

    try {
      const data = await preparePayment(memberId!, roomIdNumber!);
      setPaymentParams({
        ...paymentParams,
        merchant_uid: data.merchant_uid,
        amount: data.amount,
        name: data.product_name,
      });
    } catch (error) {
      console.error("결제 준비 실패:", error);
    }
  };

  useEffect(() => {
    if (paymentParams.amount > 0 && paymentParams.merchant_uid) {
      // Proceed with IAMPORT payment request
      if (impScriptLoaded && window.IMP) {
        window.IMP.init(import.meta.env.VITE_IMP_ID);
        const { merchant_uid, amount, name } = paymentParams;
        window.IMP.request_pay(
          {
            pg: "html5_inicis",
            pay_method: "card",
            merchant_uid,
            name,
            amount,
            buyer_email: "test@example.com",
            buyer_name: "테스터",
            buyer_tel: "01012345678",
            buyer_addr: "서울특별시 강남구",
            buyer_postcode: "01181",
          },
          async (rsp: any) => {
            if (rsp.success) {
              const impUid = rsp.imp_uid;
              const formData = new FormData();
              formData.append("impUid", impUid);

              try {
                const validateData = await validatePayment(impUid);
                setValidateResult(validateData);
                setIsCertificateVerified(true);
                setToastMessage("결제 검증 성공!");
                console.log(validateResult); //id
              } catch (validateError) {
                setValidateResult({ error: validateError });
                setToastMessage("결제가 검증되지 않았습니다.");
              }
            } else {
              alert("결제 실패: " + rsp.error_msg);
            }
          }
        );
      } else {
        console.error("IAMPORT script is not loaded.");
      }
    }
  }, [paymentParams]);

  return (
    <div className="justify-center items-center text-center flex flex-col gap-12">
      <TitleBox title="본인 확인" required>
        <div
          onClick={() => {
            if (!accessToken) {
              setToastMessage("로그인이 필요합니다.");
              return;
            }
            runIdentityVerification({
              verificationType: "room",
              roomId: roomIdNumber,
              onSuccess: () => {
                setIsPhoneVerified(true);
                setToastMessage("본인 확인이 완료되었습니다.");
              },
              onFailure: () => {
                setToastMessage("본인 인증이 완료되지 않았습니다.");
              },
            });
          }}
          className={`cursor-pointer w-[11.25rem] max-w-full h-[7.75rem] ${
            isPhoneVerified ? "bg-neutral-gray" : "bg-gold"
          } flex flex-col p-2 items-center justify-center text-neutral-white font-bold text-lg rounded-md mx-auto`}
        >
          <p>간편인증</p>
          <p>진행하기</p>
        </div>
        {isPhoneVerified && (
          <div className="text-sm">본인 확인이 완료되었습니다.</div>
        )}
      </TitleBox>
      <TitleBox title={`수수료 결제`} required>
        <div className="mx-auto">
          <InfoText text="10원의 수수료가 듭니다." />
        </div>
        <div
          onClick={handlePaymentSubmit}
          className={`cursor-pointer w-[11.25rem] max-w-full h-[7.75rem] ${
            isCertificateVerified || !isPhoneVerified
              ? "bg-neutral-gray"
              : "bg-gold"
          } flex flex-col p-2 items-center justify-center text-neutral-white font-bold text-lg rounded-md mx-auto`}
        >
          <p>수수료</p>
          <p>결제하기</p>
        </div>
        {isCertificateVerified && (
          <div className="text-sm">
            집 등록 수수료 결제가 완료되었습니다.
          </div>
        )}
      </TitleBox>
      <Button
        size="large"
        variant={isPhoneVerified && isCertificateVerified ? "point" : "default"}
        onClick={async () => {
          if (!isPhoneVerified || !isCertificateVerified) {
            openModal("notVerifed");
            return;
          }
          
          try {
            await axiosInstance.patch(`/api/v1/room/${roomId}/status/on-sale`);
            
            navigate(`/room/sell/success/${roomId}`);
          } catch (error) {
            console.error("매물 상태 변경 실패:", error);
            setToastMessage("매물 등록 처리 중 오류가 발생했습니다.");
          }
        }}
      >
        등록하기
      </Button>
      <ModalAlert
        isOpen={isOpen("notVerifed")}
        closeModal={() => closeModal("notVerifed")}
        title="확인해주세요"
        text="아직 인증이 완료되지 않았습니다."
      />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default VerifyOwner;
