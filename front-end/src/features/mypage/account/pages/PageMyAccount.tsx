import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/buttons/Button";
import LineBox from "../../../../components/LineBox";
import { useAuth } from "../../../../contexts/AuthContext";
import useModal from "../../../modal/hooks/useModal";
import ModalDeleteAccountConfirm from "../../../modal/pages/ModalDeleteAccountConfirm";
import ModalUpdateProfile from "../../components/ModalUpdateProfile";
import { getMyProfile } from "../services/accountService";
import Toast from "../../../toast/components/Toast";
import RoundedImage from "../../../../components/RoundedImage";
import { runIdentityVerification } from "../../../verify/utils/verify";
import { logoutOurService } from "../../../auth/services/authService";

const PageAccount = () => {
  const { accessToken, logout } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setNickname(data.nickName || "");
      setProfileUrl(data.profileUrl || "");
      setIsAuth(data.isAuth || false);
    } catch (err) {
      console.error("프로필 정보 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col justify-center max-w-lg mx-auto gap-2.5">
      <LineBox addClassName="w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-wrap flex-grow">
            {profileUrl ? (
              <RoundedImage src={profileUrl} size="48px" />
            ) : (
              <div className="rounded-full w-[48px] h-[48px] bg-neutral-light100" />
            )}
            <div className="font-semibold text-lg">{nickname}</div>
          </div>
          <Button onClick={() => openModal("updateProfile")} size="small">
            프로필 수정
          </Button>
          <ModalUpdateProfile
            isOpen={isOpen("updateProfile")}
            closeModal={() => closeModal("updateProfile")}
            onProfileUpdated={fetchProfile}
            setToastMessage={setToastMessage}
          />
          {toastMessage && (
            <Toast message={toastMessage} onClose={() => setToastMessage("")} />
          )}
        </div>
      </LineBox>
      <LineBox>
        <div className="flex justify-between items-center">
          {isAuth ? (
            <>
              <div>본인인증 완료 회원</div>
            </>
          ) : (
            <>
              <div className="font-bold text-coral-red">
                본인인증 미완료 회원
              </div>
              <Button
                onClick={() => {
                  if (!accessToken) {
                    setToastMessage("로그인이 필요합니다.");
                    return;
                  }

                  runIdentityVerification({
                    verificationType: "member",
                    onSuccess: () => {
                      fetchProfile();
                      setToastMessage("본인 인증 완료되었습니다.");
                    },
                    onFailure: () => {
                      setToastMessage("본인 인증이 완료되지 않았습니다.");
                    },
                  });
                }}
                size="small"
              >
                본인 인증하기
              </Button>
            </>
          )}
        </div>
      </LineBox>
      <LineBox addClassName="w-full">
        <button 
          onClick={async () => {
            setToastMessage("로그아웃 중입니다.");
            
            await logoutOurService();
            
            setTimeout(() => {
              logout(); 
            }, 1500);
          }}
          className="cursor-pointer"
        >
          로그아웃하기
        </button>
      </LineBox>

      <div className="text-right p-[0.375rem_1.5rem] text-sm text-neutral-gray">
        <button
          onClick={() => openModal("deleteAccount")}
          className="w-fit underline cursor-pointer"
        >
          탈퇴하기
        </button>
        <ModalDeleteAccountConfirm
          isOpen={isOpen("deleteAccount")}
          closeModal={() => closeModal("deleteAccount")}
          setToastMessage={setToastMessage}
        />
      </div>
    </div>
  );
};

export default PageAccount;
