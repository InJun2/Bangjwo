import { ChangeEvent, KeyboardEvent, useState } from "react";
import MaterialIcon from "./MaterialIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { getLatLngFromKeyword, loadKakaoMapScript } from "../utils/kakaoMap";
import Toast from "../features/toast/components/Toast";

// SearchBar를 재사용 가능하도록 틀로 따로 빼고, 로직은 별도 컴포넌트로 만들어서 feature 단위로 분리할까 하기도 했는데,
// 현재 검색바를 쓰는 용도가 매물 검색밖에 없어서 일단은 이쪽에 그대로 구현해놨습니다.
// 나중에 재사용할 일이 생기면 이쪽은 단순 UI 컴포넌트로 만들고, SearchBar의 UI를 그대로 끌어다쓴 매물 검색바를
// feature/room-find/components 폴더 내부로 새로 컴포넌트로 만들어서 분리 진행해주세요.

interface SearchBarProps {
  category?: string;
}

const SearchBar = ({ category }: SearchBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const search = async () => {
    if (!searchQuery.trim()) return;

    try {
      await loadKakaoMapScript();
      const { lat, lng } = await getLatLngFromKeyword(searchQuery);
      const path = category ? `/room/find/${category}` : `/room/find`;
      const urlParams = new URLSearchParams(location.search);

      urlParams.set("lat", String(lat));
      urlParams.set("lng", String(lng));

      navigate(`${path}?${urlParams.toString()}`);
    } catch (err) {
      setToastMessage("검색 결과가 없습니다.");
      console.error("Failed to search address:", err);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      search();
    }
  };

  return (
    <div className="flex w-full max-w-md border border-neutral-light100 rounded-full overflow-hidden p-[0.25rem_0.5rem_0.25rem_0.875rem] bg-real-white">
      <input
        type="text"
        value={searchQuery}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="지역 명, 지하철 역을 입력해주세요"
        className="flex-grow border-none outline-none placeholder-neutral-gray placeholder:text-sm"
      />

      {/* 차후 IconButton으로의 변경 고려 */}
      <div
        className="flex rounded-full justify-center items-center text-neutral-black bg-transparent cursor-pointer"
        onClick={search}
      >
        <MaterialIcon icon="search" />
      </div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default SearchBar;
