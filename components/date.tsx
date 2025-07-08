import React from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { IoMdArrowDropleft } from "react-icons/io";

type YearMonthDisplayProps = {
  year?: number;
  month?: number;
  style?: React.CSSProperties;
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
}) => {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const displayYear = year ?? currentYear;
  const displayMonth = month ?? currentMonth;

  return (
    <div
      className="bg-white p-6 flex flex-col items-start justify-start border"
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
        <IoMdArrowDropleft size={90} color="#990000" />
        <div className="flex flex-col items-center justify-start w-full h-full">
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

        <IoMdArrowDropright size={90} color="#990000" />
      </div>
    </div>
  );
};
