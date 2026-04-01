import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface DatePickerInputProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

type CustomInputProps = InputHTMLAttributes<HTMLInputElement> & {
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value = "", onClick, placeholder, disabled }, ref) => {
    const isFilled = value !== "";

    return (
      <input
        type="text"
        value={value}
        onClick={onClick}
        ref={ref}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        className={`px-2 py-1 text-sm font-medium border-[2.5px] rounded-sm
          outline-none ring-0
          ${
            disabled
              ? "bg-neutral-light200 text-neutral-dark100 border-neutral-light100 cursor-default"
              : isFilled
              ? "bg-white text-neutral-dark200 border-neutral-gray cursor-pointer"
              : "bg-white text-black border-green cursor-pointer"
          }
          w-[140px]`}
      />
    );
  }
);

CustomInput.displayName = "CustomInput";

const DatePickerInput = ({
  selectedDate,
  onChange,
  placeholder = "YYYY.MM.DD",
  disabled = false,
}: DatePickerInputProps) => {
  console.log(selectedDate); //임시 타입 해결
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      disabled={disabled}
      dateFormat="yyyy.MM.dd"
      locale={ko}
      placeholderText={placeholder}
      customInput={
        <CustomInput placeholder={placeholder} disabled={disabled} />
      }
    />
  );
};

export default DatePickerInput;
