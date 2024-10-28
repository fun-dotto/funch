// import React from "react";
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
  // const debugOptions: Intl.DateTimeFormatOptions = {
  //   timeZone: "Asia/Tokyo",
  //   month: "2-digit",
  //   day: "2-digit",
  // };
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
      <div className="my-2 mx-auto">
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
                      <option value=""></option>
                      <option value="主菜">主菜</option>
                      <option value="副菜・サラダ">副菜・サラダ</option>
                      <option value="丼物・カレー">丼物・カレー</option>
                      <option value="麺類">麺類</option>
                      <option value="ごはん">ごはん</option>
                      <option value="汁物">汁物</option>
                      <option value="デザート">デザート</option>
                    </select>
                    ：
                    <select name="0001" id="0001">
                      <option value=""></option>
                      <option value="チキン竜田丼">チキン竜田丼</option>
                      <option value="さらさらトン茶">さらさらトン茶</option>
                      <option value="鶏から南蛮丼">鶏から南蛮丼</option>
                      <option value="塩ダレ唐揚げ丼">塩ダレ唐揚げ丼</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div>
          <h3>{monthJST}の共通メニュー</h3>
        </div>
      </div>
    </>
  );
};

export default Edit;
