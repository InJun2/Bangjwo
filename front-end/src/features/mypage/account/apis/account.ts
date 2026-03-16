import axiosInstance from "../../../../utils/axiosInstances";
import { MemberResponseDto } from "../types/accountTypes";

export const fetchMyProfile = async (): Promise<MemberResponseDto> => {
  const res = await axiosInstance.get<MemberResponseDto>("/api/v1/member/me");
  return res.data;
};

export const patchMyProfile = async (formData: FormData) => {
  const res = await axiosInstance.patch("/api/v1/member/me", formData);
  return res.data;
};
