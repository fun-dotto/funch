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
      className="bg-white p-4 md:p-6 flex flex-col items-center justify-center border w-72 md:w-[290px] h-48 md:h-[200px]"
      style={{
        borderRadius: "16px",
        borderColor: "#CCCCCC",
        borderWidth: "1px",
        ...style,
      }}
    >
      <div className="flex flex-row">
        <button className="mr-1 md:mr-2" onClick={handlePrevious}>
          <IoMdArrowDropleft
            size={60}
            className="md:w-15 md:h-15"
            color="#990000"
          />
        </button>
        <div className="flex flex-col items-center justify-start w-24 md:w-[120px] h-full">
          <div className="text-[#990000] font-bold leading-none text-lg md:text-2xl">
            {displayYear}
          </div>
          <div className="text-[#990000] font-bold leading-none text-3xl md:text-5xl">
            {displayMonth}月
          </div>
        </div>

        <button className="ml-1 md:ml-2" onClick={handleNext}>
          <IoMdArrowDropright
            size={60}
            className="md:w-15 md:h-15"
            color="#990000"
          />
        </button>
      </div>
      <div className="pt-4 md:pt-6">
        <Button variant="default" className="bg-[#0089F0] hover:bg-[#0060AB]">
          メニューの確定
        </Button>
      </div>
    </div>
  );
};
