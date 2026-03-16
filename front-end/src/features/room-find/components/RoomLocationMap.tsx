// src/components/RoomLocationMap.tsx
import { useEffect, useRef } from "react";
import { loadKakaoMapScript, getLatLngFromAddress } from "../../../utils/kakaoMap"; 

interface RoomLocationMapProps {
  address: string;
}

const RoomLocationMap = ({ address }: RoomLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // 1. 카카오맵 스크립트 로드 대기 (유틸 함수)
        await loadKakaoMapScript();

        // 2. 주소를 위도/경도로 변환 (유틸 함수)
        const { lat, lng } = await getLatLngFromAddress(address);

        if (!mapRef.current || !window.kakao) return;

        // 3. 변환된 좌표로 지도 중심점 설정
        const coords = new window.kakao.maps.LatLng(lat, lng);
        const options = {
          center: coords,
          level: 4, // 줌 레벨 (숫자가 작을수록 확대, 3~4가 적당합니다)
        };

        // 4. 지도 객체 생성
        const map = new window.kakao.maps.Map(mapRef.current, options);

        // 5. 정중앙에 핀(마커) 꽂기
        new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });

        // 6. 줌에 맞게 핀을 화면 중앙으로 이동 (혹시 모를 어긋남 방지)
        map.setCenter(coords);

      } catch (error) {
        console.error("카카오맵 로드 또는 좌표 변환 실패:", error);
      }
    };

    if (address) {
      initMap();
    }
  }, [address]);

  return <div ref={mapRef} className="w-full h-[160px] rounded-lg shadow-sm bg-neutral-gray" />;
};

export default RoomLocationMap;