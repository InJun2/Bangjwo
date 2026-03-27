import {
  fetchRooms,
  fetchDetailRoom,
  postRoom,
  fetchMyRooms,
  patchRoom,
  deleteRoom,
} from "../apis/room";
import {
  RoomResponse,
  RoomQueryParams,
  defaultParams,
  RoomDetailResponse,
} from "../types/roomTypes";

export const getRooms = async (params: RoomQueryParams = defaultParams) => {
  try {
    const roomsData: RoomResponse = await fetchRooms(params);
    return roomsData;
  } catch (err) {
    console.error("Error fetching rooms:", err);
    throw err;
  }
};

export const getRoomDetail = async (
  roomId: number
): Promise<RoomDetailResponse> => {
  try {
    const room = await fetchDetailRoom(roomId);
    return room;
  } catch (err) {
    console.error("Error  fetching room detail:", err);
    throw err;
  }
};

export const createRoom = async (formData: FormData) => {
  try {
    const result = await postRoom(formData);
    return result;
  } catch (err) {
    console.error("Error posting room:", err);
    throw err;
  }
};

export const updateRoom = async (roomId: number, formData: FormData) => {
  try {
    const result = await patchRoom(roomId, formData);
    return result;
  } catch (err) {
    console.error("Error updating room:", err);
    throw err;
  }
};

export const getMyRooms = async (page: number = 0, size: number = 15) => {
  try {
    const data = await fetchMyRooms(page, size);
    return data;
  } catch (error) {
    console.error("Error fetching my rooms:", error);
    throw error;
  }
};

export const deleteRoomApi = async (roomId: number) => {
  try {
    const result = await deleteRoom(roomId);
    return result;
  } catch (err) {
    console.error("Error deleting room:", err);
    throw err;
  }
};