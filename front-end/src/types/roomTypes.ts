export interface Pagable {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface Room {
  roomId: number;
  memberId: number;
  isLiked: boolean;
  buildingType: string;
  status: string;
  deposit: number;
  monthlyRent: number;
  exclusiveArea: number;
  supplyArea: number;
  maintenanceCost: number;
  simpleDescription: string;
  floor: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

export const defaultRoom: Room = {
  roomId: 0,
  memberId: 0,
  isLiked: false,
  buildingType: "",
  status: "",
  deposit: 0,
  monthlyRent: 0,
  exclusiveArea: 0,
  supplyArea: 0,
  maintenanceCost: 0,
  simpleDescription: "",
  floor: "",
  imageUrl: "",
  lat: 37.5,
  lng: 127.04,
};

//RoomListResponseDto
export interface RoomResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  size: number;
  currentPageItemCount: number;
  offset: number;
  items: Room[];
}

// 쿼리
export interface RoomQueryParams {
  buildingType?: string;
  price?: number | null;
  areaTypes?: AreaType | null;
  lat?: number;
  lng?: number;
  zoom?: number;
  page?: number;
}

export const defaultParams: RoomQueryParams = {
  buildingType: "ONEROOM_TWOROOM",
  price: null,
  areaTypes: null,
  lat: 37.5,
  lng: 127.04,
  zoom: 4,
  page: 1,
};

export type AreaType =
  | "ALL"
  | "UNDER_TEN"
  | "TEN_RANGE"
  | "TWENTY_RANGE"
  | "THIRTY_RANGE"
  | "FORTY_RANGE"
  | "OVER_FIFTY"
  | null;

export interface RoomImage {
  imageId: number;
  imageUrl: string;
}

export type MaintenanceIncludeName =
  | "WATER"
  | "ELECTRICITY"
  | "INTERNET"
  | "GAS"
  | "CLEANING"
  | "CABLE_TV"
  | "PARKING"
  | "HEATING"
  | "ELEVATOR_MAINTENANCE";

export type RoomOption =
  | "ELEVATOR"
  | "ROOFTOP"
  | "AIR_CONDITIONER"
  | "WASHING_MACHINE"
  | "REFRIGERATOR"
  | "MICROWAVE"
  | "GAS_RANGE"
  | "INDUCTION"
  | "BED";

export type RoomBuildingType =
  | "ONEROOM_TWOROOM"
  | "APARTMENT"
  | "VILLA_HOUSE"
  | "OFFICETEL";

export type RoomDirection =
  | "NORTH"
  | "NORTHEAST"
  | "EAST"
  | "SOUTHEAST"
  | "SOUTH"
  | "SOUTHWEST"
  | "WEST"
  | "NORTHWEST";

export interface RoomDetailResponse {
  roomId: number;
  memberId: number;
  profileUrl?: string | null;
  isLiked: boolean;
  roomStatus: string;
  buildingType: string;
  realEstateId: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  lat: number;
  lng: number;
  deposit: number;
  monthlyRent: number;
  exclusiveArea: number;
  supplyArea: number;
  totalUnits: number;
  floor: string;
  maxFloor: number;
  parkingSpaces: number;
  availableFrom: string;
  permissionDate: string;
  simpleDescription: string;
  description: string;
  maintenanceCost: number;
  roomCnt: number;
  bathroomCnt: number;
  direction: string;
  discussable: boolean;
  discussDetail: string;
  reviewable: boolean;
  isPhonePublic: boolean;
  reviewCnt: number;
  nickname: string;
  phoneNumber: string;
  createDate: string;
  updateDate: string;
  maintenanceIncludes: MaintenanceIncludeName[];
  options: RoomOption[];
  images: RoomImage[];
}

export interface RoomRequestBaseDto {
  deposit: number;
  monthlyRent: number;
  exclusiveArea: number;
  supplyArea: number;
  totalUnits: number;
  floor: string;
  maxFloor: number;
  parkingSpaces: number;
  availableFrom: string;
  permissionDate: string;
  simpleDescription: string;
  description: string;
  maintenanceCost: number;
  roomCnt: number;
  bathroomCnt: number;
  direction: string;
  discussable: boolean;
  discussDetail: string;
  reviewable: boolean;
  isPhonePublic: boolean;
  maintenanceIncludes: MaintenanceIncludeName[];
  options: RoomOption[];
  images: string[];
}

export interface CreateRoomRequestDto extends RoomRequestBaseDto {
  buildingType: RoomBuildingType;
  realEstateId: string;
  postalCode: string;
  address: string;
  addressDetail: string;
}

export interface UpdateRoomRequestDto extends RoomRequestBaseDto {
  deleteImageIds: number[];
}
