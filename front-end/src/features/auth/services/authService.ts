import axiosInstance from "../../../utils/axiosInstances";
import { deleteAccount, postKakaoAuth } from "../apis/auth";

export const postLogoutOurService = () => {
  return axiosInstance.post("/api/v1/logout");
};

export const loginWithKakao = async (
  code: string,
  login: (accessToken: string) => void
) => {
  try {
    const res = await postKakaoAuth(code);
    console.log("로그인 성공:", res.data);

    login(res.data.accessToken);

    return res.data;
  } catch (err) {
    console.error("로그인 실패:", err);
    throw err;
  }
};

export const leaveOurService = async () => {
  try {
    const res = await deleteAccount();
    console.log("회원 탈퇴 성공:", res);
    return res;
  } catch (err) {
    console.error("회원 탈퇴 실패:", err);
    throw err;
  }
};

export const logoutOurService = async () => {
  try {
    await postLogoutOurService();
    console.log("백엔드 로그아웃(토큰 삭제) 완료");
  } catch (err) {
    console.error("백엔드 로그아웃 실패:", err);
  }
};