import React, { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { IoMdArrowDropleft } from "react-icons/io";
import { Button } from "./ui/button";

type YearMonthDisplayProps = {
  year?: number;
  month?: number;
  style?: React.CSSProperties;
  onYearMonthChange?: (year: number, month: number) => void;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 0-indexed
  };
};

export const YearMonthDisplay: React.FC<YearMonthDisplayProps> = ({
  year,
  month,
  style,
  onYearMonthChange,
}) => {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const [displayYear, setDisplayYear] = useState(year ?? currentYear);
  const [displayMonth, setDisplayMonth] = useState(month ?? currentMonth);

  const handlePrevious = () => {
    let newYear = displayYear;
    let newMonth = displayMonth - 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear = displayYear - 1;
    }

    setDisplayYear(newYear);
    setDisplayMonth(newMonth);
    onYearMonthChange?.(newYear, newMonth);
  };

  const handleNext = () => {
    let newYear = displayYear;
    let newMonth = displayMonth + 1;

    if (newMonth > 12) {
      newMonth = 1;
      newYear = displayYear + 1;
    }

    setDisplayYear(newYear);
    setDisplayMonth(newMonth);
    onYearMonthChange?.(newYear, newMonth);
  };

  return (
    <div
      className="bg-white p-6 flex flex-col items-center justify-center border"
      style={{
        width: "290px",
        height: "200px",
        borderRadius: "16px",
        borderColor: "#CCCCCC",
        borderWidth: "1px",
        ...style,
      }}
    >
      <div className="flex flex-row">
        <button className="mr-2" onClick={handlePrevious}>
          <IoMdArrowDropleft size={60} color="#990000" />
        </button>
        <div className="flex flex-col items-center justify-start w-[120px] h-full">
          <div
            className="text-[#990000] font-bold leading-none"
            style={{ fontSize: "24px" }}
          >
            {displayYear}
          </div>
          <div
            className="text-[#990000] font-bold leading-none"
            style={{ fontSize: "48px" }}
          >
            {displayMonth}月
          </div>
        </div>

        <button className="ml-2" onClick={handleNext}>
          <IoMdArrowDropright size={60} color="#990000" />
        </button>
      </div>
      <div className="pt-6">
        <Button variant="default" className="bg-[#0089F0] hover:bg-[#0060AB]">
          メニューの確定
        </Button>
      </div>
    </div>
  );
};
