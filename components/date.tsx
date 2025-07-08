// YearMonthDisplay.tsx
import React from "react";

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
    <div style={{ fontWeight: "bold", fontSize: 20, ...style }}>
      {displayYear}年{displayMonth}月
    </div>
  );
};
