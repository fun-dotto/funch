"use client";

import { FC } from "react";

type PriceInputProps = {
  label: string;
  value: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
};

export const PriceInput: FC<PriceInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "数値のみ半角入力",
  required = false,
  min = "0",
}) => {
  return (
    <div className="w-[24%]">
      <label className="text-[14px] text-[#990000] font-medium pb-1">
        {label}
      </label>
      <div className="">
        <input
          type="number"
          className="w-full h-[38px] px-2 text-[14px] rounded border border-[#CCCCCC] focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          required={required}
        />
      </div>
    </div>
  );
};
