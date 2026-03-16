import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getMyProfile } from "../../mypage/account/services/accountService";
import LayoutMain from "../../../layouts/LayoutMain";
import MaterialIcon from "../../../components/MaterialIcon";
import LayoutNotice from "../../../layouts/LayoutNotice";
import ModalAlert from "../../modal/pages/ModalAlert";
import useModal from "../../modal/hooks/useModal";

interface RedirectIfNotAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

const RedirectIfNotAuth = ({
  children,
  redirectTo = "/mypage",
}: RedirectIfNotAuthProps) => {
  const { status } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (status === "unauthenticated") {
        navigate("/login");
        return;
      }

      if (status === "authenticated") {
        try {
          const profile = await getMyProfile();
          if (profile.isAuth) {
            setIsAuth(true);
            setLoading(false);
          }
        } catch (err) {
          openModal("alert");
          console.error("본인 인증 여부 확인 실패:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [status, navigate, redirectTo]);

  if (status === "loading" || loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        로그인 및 본인 인증 상태를 확인 중입니다…
      </div>
    );
  }

  return isAuth ? (
    children
  ) : (
    <LayoutMain>
      <LayoutNotice
        // infoText="Locked Page"
        buttonText="본인 인증하러 가기"
        bgColor="neutral-dark300"
        onClick={() => {
          navigate("/mypage");
        }}
      >
        {!isOpen("alert") && (
          <div>
            <MaterialIcon icon="lock" />
            <p> 마이페이지에서 본인 인증 후</p>
            <p>열람 가능한 페이지입니다.</p>
          </div>
        )}
      </LayoutNotice>
      <ModalAlert
        isOpen={isOpen("alert")}
        closeModal={() => {
          closeModal("alert");
          navigate("/");
        }}
        title="안내"
        text={`본인 인증 여부를 확인하지 못했습니다.\n다시 로그인하거나, 다시 접속해주세요.`}
      />
    </LayoutMain>
  );
};

export default RedirectIfNotAuth;
