import { ReactNode, useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import FilterChip from "./FilterChip";
import Slider from "./Slider";
import Button from "./buttons/Button";
import { AreaType } from "../types/roomTypes";

interface FilterPannelProps {
  childrenTop?: ReactNode;
  childrenBottom?: ReactNode;
  selectedPrice: number;
  selectedAreaTypes: AreaType[];
  onApplyFilters: (filters: { price: number; areaTypes: AreaType[] }) => void;
}

const FilterPannel = ({
  childrenTop,
  childrenBottom,
  selectedPrice,
  selectedAreaTypes,
  onApplyFilters,
}: FilterPannelProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<AreaType[]>(
    selectedAreaTypes || []
  );

  const filterOptions: { label: string; value: AreaType }[] = [
    { label: "전체", value: "ALL" },
    { label: "10평 미만", value: "UNDER_TEN" },
    { label: "10평대", value: "TEN_RANGE" },
    { label: "20평대", value: "TWENTY_RANGE" },
    { label: "30평대", value: "THIRTY_RANGE" },
    { label: "40평대", value: "FORTY_RANGE" },
    { label: "50평 이상", value: "OVER_FIFTY" },
  ];

  const [price, setPrice] = useState(selectedPrice);

  useEffect(() => {
    setPrice(selectedPrice);
    setSelectedFilters(selectedAreaTypes || []);
  }, [selectedPrice, selectedAreaTypes]);

  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  const handleSelectedFilters = (filter: AreaType) => {
    setSelectedFilters((prev) => {
      // "ALL"을 선택한 경우
      if (filter === "ALL") {
        // "ALL"을 선택하면 다른 모든 필터를 해제하고 "ALL"만 선택
        return prev.includes("ALL") ? [] : ["ALL"];
      }

      // "ALL"이 이미 선택되어 있으면 다른 값을 추가할 수 없도록 막기
      if (prev.includes("ALL")) {
        return [filter]; // "ALL"을 제거하고 선택된 필터만 추가
      }

      // 필터가 이미 선택되었으면 제외, 아니면 추가
      if (prev.includes(filter)) {
        return prev.filter((item) => item !== filter); // 이미 선택된 필터는 제외
      } else {
        return [...prev, filter]; // 새로운 필터를 추가
      }
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters({ price, areaTypes: selectedFilters });
    closeFilter();
  };

  const isAllSelected = selectedFilters.includes("ALL");

  return (
    <div className="filter-wrapper w-full relative overflow-hi">
      <div className="relative z-2 bg-real-white flex flex-col gap-2 w-full p-[0.625rem_0.75rem] border-b-1 border-neutral-light100">
        {childrenTop && <>{childrenTop}</>}
        <FilterBar
          selectedFilters={selectedFilters.map((filter) => {
            // filter가 "ALL"이면 "전체"를 반환, 그렇지 않으면 해당하는 label을 반환
            const filterOption = filterOptions.find(
              (option) => option.value === filter
            );
            return filterOption ? filterOption.label : ""; // 해당하는 label이 없으면 빈 문자열을 반환
          })}
          onClick={toggleFilter}
        />
        {childrenBottom && <>{childrenBottom}</>}
      </div>

      {isFilterOpen && (
        <div className="scroll-custom absolute top-full left-0 bg-real-white z-1 overflow-auto max-h-[min(calc(100vh-55px-7.9rem),27rem)] border-b-1 border-neutral-light100 shadow-custom">
          <div className="flex w-full justify-between border-b-1 border-neutral-light100 p-[0.75rem]">
            <span>필터</span>
            <i
              className="material-symbols-rounded cursor-pointer"
              onClick={closeFilter}
            >
              close
            </i>
          </div>
          <div className="w-full p-[0.5rem_0.75rem] flex flex-col gap-2">
            <p className="font-medium">면적</p>
            <div className="w-full flex flex-wrap gap-1">
              {filterOptions.map((item, index) => {
                const isSelected = selectedFilters.includes(item.value);
                return (
                  <FilterChip
                    key={index}
                    text={
                      isAllSelected && item.label === "전체"
                        ? "전체 해제"
                        : item.label === "전체"
                        ? "전체"
                        : item.label
                    }
                    type={
                      item.label === "전체" && isSelected
                        ? "gray"
                        : isSelected || isAllSelected
                        ? "selected"
                        : "default"
                    }
                    onClick={() => handleSelectedFilters(item.value)}
                  />
                );
              })}
            </div>
          </div>
          <div className="w-full p-[0.5rem_0.75rem] flex flex-col gap-2">
            <p className="font-medium">가격</p>
            <Slider
              title="월세"
              min={0}
              max={3000000}
              value={price}
              onChange={handlePriceChange}
            />
          </div>
          <div className="mt-2 mb-5 mx-3">
            <Button
              size="basic"
              variant="dark"
              isAngular
              className="w-full"
              onClick={handleApplyFilters}
            >
              적용하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPannel;
