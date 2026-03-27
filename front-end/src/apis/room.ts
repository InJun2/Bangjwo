import axiosInstance from "../utils/axiosInstances";
import {
  RoomResponse,
  RoomQueryParams,
  RoomDetailResponse,
} from "../types/roomTypes";

export const fetchRooms = async (params: RoomQueryParams) => {
  const res = await axiosInstance.get<RoomResponse>("/api/v1/room", { params });
  return res.data;
};

export const fetchDetailRoom = async (roomId: number) => {
  const res = await axiosInstance.get<RoomDetailResponse>(
    `/api/v1/room/${roomId}`
  );
  return res.data;
};

export const postRoom = async (formData: FormData) => {
  const res = await axiosInstance.post("/api/v1/room", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const patchRoom = async (roomId: number, formData: FormData) => {
  const res = await axiosInstance.patch(`/api/v1/room/${roomId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const fetchMyRooms = async (page: number = 0, size: number) => {
  const res = await axiosInstance.get<RoomResponse>("/api/v1/room/me", {
    params: { page, size },
  });
  return res.data;
};

export const deleteRoom = async (roomId: number) => {
  const res = await axiosInstance.delete(`/api/v1/room/${roomId}`);
  return res.data;
};