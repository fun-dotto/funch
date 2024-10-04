import React from "react";
import { useParams } from "react-router-dom";

const Edit = () => {
  const { year, month } = useParams();
  let canView = true;
  let targetYear = 0;
  let targetMonth = -1;
  if (year == undefined || month == undefined) {
    canView = false;
  } else {
    targetYear = parseInt(year);
    targetMonth = parseInt(month);
    if (
      targetMonth <= 0 ||
      targetMonth > 12 ||
      targetYear < 2024 ||
      Number.isNaN(targetYear) ||
      Number.isNaN(targetMonth)
    ) {
      canView = false;
    }
  }
  if (!canView) {
    return <div>無効です</div>;
  }

  const targetDay = new Date(targetYear, targetMonth - 1);
  const monthStartDay = new Date(targetDay);
  monthStartDay.setDate(1);
  const monthEndDay = new Date(targetDay);
  monthEndDay.setMonth(targetDay.getMonth() + 1, 0);
  const dayOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    day: "numeric",
  };
  const debugOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  };
  const yearJST = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(monthStartDay);
  const monthJST = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
  }).format(monthStartDay);

  const calendar: Date[] = [];
  const calendarStartDate = new Date(monthStartDay);
  calendarStartDate.setDate(
    1 + monthStartDay.getDay() == 0 ? -6 : 1 - monthStartDay.getDay()
  );
  let i = 0;
  for (i = 0; i < 7 * 5; i++) {
    const pushDate = new Date(calendarStartDate);
    pushDate.setDate(pushDate.getDate() + i);
    calendar.push(pushDate);
  }
  const checkDate = new Date(calendarStartDate);
  checkDate.setDate(checkDate.getDate() + i);
  if (checkDate <= monthEndDay) {
    for (; i < 7 * 6; i++) {
      const pushDate = new Date(calendarStartDate);
      pushDate.setDate(pushDate.getDate() + i);
      calendar.push(pushDate);
    }
  }

  const calendarWeekStr = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <>
      <h2>
        {yearJST}
        {monthJST}
      </h2>
      <div className="m-4 text-center">
        <div className="grid grid-cols-7 justify-items-stretch text-left gap-0.5">
          {calendarWeekStr.map((v) => (
            <div className="w-full bg-gray-200 border-gray-300 rounded p-2 text-center">
              {v}
            </div>
          ))}
          {calendar.map((v) => (
            <div className="w-full bg-gray-200 border-gray-300 rounded p-2">
              {v >= monthStartDay && v <= monthEndDay && (
                <>
                  {new Intl.DateTimeFormat("ja-JP", dayOptions).format(v)}
                  <div>
                    <select name="0000" id="0000">
                      <option value="a">a</option>
                      <option value="b">b</option>
                      <option value="c">c</option>
                      <option value="d">d</option>
                    </select>
                    ：
                    <select name="0000" id="0000">
                      <option value="a">a</option>
                      <option value="b">b</option>
                      <option value="c">c</option>
                      <option value="d">d</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Edit;
