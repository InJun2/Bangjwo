import { useEffect, useRef, useState } from "react";
import { loadKakaoMapScript, removeKakaoMapScript } from "../utils/kakaoMap";
import { Room } from "../types/roomTypes";

interface KakaoMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  onCenterChanged?: (lat: number, lng: number) => void;
  onZoomChanged?: (zoom: number) => void;
  rooms?: Room[];
  onRoomClick?: (roomId: number) => void;
}

const KakaoMap = ({
  lat,
  lng,
  zoom = 4,
  onCenterChanged,
  onZoomChanged,
  rooms = [],
  onRoomClick,
}: KakaoMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      await loadKakaoMapScript();
      const { kakao } = window;
      kakao.maps.load(() => {
        if (!mapContainer.current || mapInstance.current) return;
        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(mapContainer.current, { center, level: zoom });
        mapInstance.current = map;

        kakao.maps.event.addListener(map, "dragend", () => {
          const center = map.getCenter();
          if (onCenterChanged) onCenterChanged(center.getLat(), center.getLng());
        });
        kakao.maps.event.addListener(map, "zoom_changed", () => {
          if (onZoomChanged) onZoomChanged(map.getLevel());
        });
        setIsMapReady(true);
      });
    };
    initializeMap();
    return () => {
      removeKakaoMapScript();
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && window.kakao) {
      const newCenter = new window.kakao.maps.LatLng(lat, lng);
      const currentCenter = mapInstance.current.getCenter();
      if (
        Math.abs(currentCenter.getLat() - lat) > 0.0001 ||
        Math.abs(currentCenter.getLng() - lng) > 0.0001
      ) {
        mapInstance.current.setCenter(newCenter);
      }
    }
  }, [lat, lng]);

  // 줌 반영 (기존 동일)
  useEffect(() => {
    if (mapInstance.current && zoom !== undefined) {
      if (mapInstance.current.getLevel() !== zoom) {
        mapInstance.current.setLevel(zoom);
      }
    }
  }, [zoom]);

  useEffect(() => {
    if (!isMapReady || !mapInstance.current || !window.kakao || !rooms) return;

    const { kakao } = window;
    const map = mapInstance.current;

    // 이전 마커 싹 지우기
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const groupedRooms = rooms.reduce((acc, room) => {
      const key = `${room.lat}_${room.lng}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(room);
      return acc;
    }, {} as Record<string, Room[]>);

    Object.values(groupedRooms).forEach((group) => {
      const position = new kakao.maps.LatLng(group[0].lat, group[0].lng);

      // 전체 껍데기
      const wrapper = document.createElement("div");
      wrapper.className = "relative flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200 origin-bottom";

      const dropdown = document.createElement("div");
      dropdown.className = "absolute bottom-[100%] mb-1 hidden flex-col bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-[9999] min-w-[120px]";
      
      group.forEach((r) => {
        const item = document.createElement("div");
        item.className = "px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100 border-b border-neutral-100 last:border-none text-center font-medium";
        item.innerText = `${r.deposit / 10000}/${r.monthlyRent / 10000} (방 번호: ${r.roomId})`;
        
        item.onclick = (e) => {
          e.stopPropagation(); // 지도나 부모의 클릭 이벤트 방지
          if (onRoomClick) onRoomClick(r.roomId);
          dropdown.classList.add("hidden"); // 누르면 리스트 닫기
        };
        dropdown.appendChild(item);
      });
      wrapper.appendChild(dropdown); // 껍데기에 드롭다운 미리 장착 (hidden 상태)

      const bubble = document.createElement("div");
      bubble.className = "rounded-xl px-3 py-1.5 bg-gold text-neutral-white text-sm font-semibold shadow-md whitespace-nowrap";
      
      if (group.length === 1) {
        bubble.innerText = `${group[0].deposit / 10000}/${group[0].monthlyRent / 10000}`;
        bubble.onclick = () => {
          if (onRoomClick) onRoomClick(group[0].roomId);
        };
      } else {
        bubble.innerText = `${group[0].deposit / 10000}/${group[0].monthlyRent / 10000} 외 ${group.length - 1}개`;
        bubble.onclick = (e) => {
          e.stopPropagation();
          document.querySelectorAll('.room-dropdown-menu').forEach(el => el.classList.add('hidden'));
          
          if (dropdown.classList.contains("hidden")) {
            dropdown.classList.remove("hidden");
            dropdown.classList.add("flex", "room-dropdown-menu");
          } else {
            dropdown.classList.add("hidden");
            dropdown.classList.remove("flex", "room-dropdown-menu");
          }
        };
      }

      const tail = document.createElement("div");
      tail.className = "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gold";

      wrapper.appendChild(bubble);
      wrapper.appendChild(tail);

      const customOverlay = new kakao.maps.CustomOverlay({
        position,
        content: wrapper,
        yAnchor: 1,
        zIndex: group.length > 1 ? 4 : 3,
        map,
      });

      markersRef.current.push(customOverlay);
    });
    
    kakao.maps.event.addListener(map, 'click', () => {
      document.querySelectorAll('.room-dropdown-menu').forEach(el => el.classList.add('hidden'));
    });

  }, [rooms, isMapReady, onRoomClick]);

  return <div ref={mapContainer} className="flex-grow h-full" />;
};

export default KakaoMap;