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
  placeholder = "価格を入力",
  required = false,
  min = "0",
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="number"
          className="w-full py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
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
