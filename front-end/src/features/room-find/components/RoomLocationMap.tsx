// src/components/RoomLocationMap.tsx
import { useEffect, useRef } from "react";
import { loadKakaoMapScript, getLatLngFromAddress } from "../../../utils/kakaoMap"; 

// 💡 1. 여기서 lat과 lng를 선택적(?)으로 받을 수 있게 추가합니다!
interface RoomLocationMapProps {
  address: string;
  lat?: number;
  lng?: number;
}

// 💡 2. 파라미터로 lat과 lng를 꺼내옵니다.
const RoomLocationMap = ({ address, lat, lng }: RoomLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadKakaoMapScript();

        // 💡 3. 백엔드에서 받은 위도/경도가 있다면 그걸 쓰고, 없다면 카카오API로 주소 변환을 시도합니다.
        let finalLat = lat;
        let finalLng = lng;

        if (!finalLat || !finalLng) {
          const coords = await getLatLngFromAddress(address);
          finalLat = coords.lat;
          finalLng = coords.lng;
        }

        if (!mapRef.current || !window.kakao) return;

        // 확실한 좌표(finalLat, finalLng)로 지도를 그립니다.
        const coords = new window.kakao.maps.LatLng(finalLat, finalLng);
        const options = {
          center: coords,
          level: 4, 
        };

        const map = new window.kakao.maps.Map(mapRef.current, options);

        new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });

        map.setCenter(coords);

      } catch (error) {
        console.error("카카오맵 로드 또는 좌표 변환 실패:", error);
      }
    };

    if (address || (lat && lng)) {
      initMap();
    }
  }, [address, lat, lng]);

  return <div ref={mapRef} className="w-full h-[160px] rounded-lg shadow-sm bg-neutral-gray" />;
};

export default RoomLocationMap;