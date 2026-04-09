import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../../../services/roomService";
import {
  AreaType,
  RoomQueryParams,
  RoomResponse,
  defaultParams,
} from "../../../types/roomTypes";
import SideBar from "../components/SideBar";
import ListRoom from "../../../components/ListRoom";
import KakaoMap from "../../../components/KakaoMap";
import SearchBar from "../../../components/SearchBar";
import InfoText from "../../../components/InfoText";
import FilterPannel from "../../../components/FilterPannel";
import RoomDetail from "../components/RoomDetail";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const PageRoomFind = () => {
  const { category } = useParams();
  const [params, setParams] = useState<RoomQueryParams>(defaultParams);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const lat = urlParams.get("lat");
    const lng = urlParams.get("lng");
    const zoom = urlParams.get("zoom");
    const roomId = urlParams.get("roomId");
    const areaTypes = urlParams.get("areaTypes");
    const price = urlParams.get("price");

    setParams((prevParams) => ({
      ...prevParams,
      lat: lat ? parseFloat(lat) : prevParams.lat,
      lng: lng ? parseFloat(lng) : prevParams.lng,
      zoom: zoom ? parseInt(zoom, 10) : prevParams.zoom,
      buildingType: category ?? "ONEROOM_TWOROOM",
      price: price ? parseInt(price, 10) : undefined,
      areaTypes: areaTypes ? (areaTypes as AreaType) : null,
    }));

    if (roomId) {
      setSelectedRoomId(parseInt(roomId, 10));
    }
  }, [location.search, category]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (selectedRoomId !== null) {
      urlParams.set("roomId", String(selectedRoomId));
    } else {
      urlParams.delete("roomId");
    }

    urlParams.set("lat", String(params.lat));
    urlParams.set("lng", String(params.lng));
    urlParams.set("zoom", String(params.zoom));

    navigate(`?${urlParams.toString()}`, { replace: true });
  }, [selectedRoomId, params.lat, params.lng, params.zoom, navigate]);

  const { data, isLoading, isError, error } = useQuery<RoomResponse, Error>({
    queryKey: ["rooms", params],
    queryFn: () => getRooms(params),
    enabled: !!params.lat && !!params.lng,
  });

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
    
    const selectedRoom = data?.items?.find((room) => room.roomId === roomId);
    if (selectedRoom) {
      setParams((prev) => ({
        ...prev,
        lat: selectedRoom.lat,
        lng: selectedRoom.lng,
      }));
    }
  };

  const handleApplyFilters = (filters: {
    price: number;
    areaTypes: AreaType[];
  }) => {
    const urlParams = new URLSearchParams(window.location.search);

    console.log("Filters applied:", filters);
    if (filters.price > 0) {
      urlParams.set("price", String(filters.price));
    } else {
      urlParams.delete("price");
    }
    if (filters.areaTypes.length > 0) {
      urlParams.set("areaTypes", String(filters.areaTypes));
    } else {
      urlParams.delete("areaTypes");
    }
    navigate(`?${urlParams.toString()}`, { replace: true });
  };

  return (
    <div className="flex w-full min-h-0">
      <SideBar />

      {/* pannel */}
      <div className="flex flex-col items-center bg-real-white relative w-[340px] border-r-1 border-neutral-light100 z-2">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <FilterPannel
            childrenTop={<SearchBar />}
            childrenBottom={<InfoText text="'방줘'에는 월세만 있습니다." />}
            selectedPrice={0}
            selectedAreaTypes={[]}
            onApplyFilters={handleApplyFilters}
          />

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              {/* <span>Now Loading...</span> */}
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center">
              <span>Error: {error.message}</span>
            </div>
          ) : (
            <ListRoom
              listClassName="flex-1 overflow-y-auto"
              rooms={data?.items || []}
              onSelectRoom={handleRoomSelect}
            />
          )}
        </div>

        {/* modal */}
        <RoomDetail
          selectedRoomId={selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
        />
      </div>

      {/* map */}
      <KakaoMap
        lat={params.lat ?? 37.5}
        lng={params.lng ?? 127.04}
        zoom={params.zoom}
        onCenterChanged={(newLat, newLng) => {
          if (params.lat !== newLat || params.lng !== newLng) {
            setParams((prev) => ({
              ...prev,
              lat: newLat,
              lng: newLng,
            }));
          }
        }}
        onZoomChanged={(newZoom) => {
          if (params.zoom !== newZoom) {
            setParams((prev) => ({
              ...prev,
              zoom: newZoom,
            }));
          }
        }}
        rooms={data?.items}

        onRoomClick={handleRoomSelect}
      />
    </div>
  );
};

export default PageRoomFind;
