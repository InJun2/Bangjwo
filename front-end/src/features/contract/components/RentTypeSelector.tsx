interface RentTypeSelectorProps {
  mode: "lessor" | "lessee";
  value: "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY" | null;
  onChange: (value: "MONTHLY_WITH_DEPOSIT" | "PURE_MONTHLY") => void;
}

// RentTypeSelector.tsx 내부 수정
const RentTypeSelector = ({ mode, value, onChange }: RentTypeSelectorProps) => {
  const isLessee = mode === "lessee";

  if (isLessee) {
    value = "MONTHLY_WITH_DEPOSIT";
  }

  const rentOptions = [
    { label: "보증금 있는 월세", value: "MONTHLY_WITH_DEPOSIT" as const },
    { label: "월세", value: "PURE_MONTHLY" as const },
  ];

  return (
    <div
      className={`border-3 rounded-sm p-4 flex flex-col gap-3 w-fit
        ${
          isLessee
            ? "bg-neutral-light200 border-neutral-light100"
            : "bg-white " +
              (value === null ? "border-green" : "border-neutral-gray")
        }`}
    >
      {rentOptions.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 text-sm font-bold ${
            isLessee ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input
            type="radio"
            name="rentType"
            value={option.value}
            checked={value === option.value}
            onChange={() => !isLessee && onChange(option.value)}
            disabled={isLessee}
            className={`
            sr-only
          `}
          />
          <div
            className={`
            w-[16px] h-[16px] border-2
            ${value === option.value ? "bg-neutral-dark200" : "bg-white"}
            ${isLessee ? "border-neutral-dark100" : "border-neutral-dark200"}
            ${isLessee ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default RentTypeSelector;
