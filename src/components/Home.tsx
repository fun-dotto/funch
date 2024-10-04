import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const targetDay = new Date(2024, 10 - 1);
  const dayOptions = {
    timeZone: "Asia/Tokyo",
    day: "numeric",
  };
  const monthOptions = {
    timeZone: "Asia/Tokyo",
    month: "numeric",
  };
  const monthStartDay = new Date(targetDay);
  monthStartDay.setDate(1);
  const monthEndDay = new Date(targetDay);
  monthEndDay.setMonth(targetDay.getMonth() + 1, 0);

  return (
    <div>
      <div>
        <Link to="/login">
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
            ログイン
          </button>
        </Link>
      </div>
      <div>{targetDay.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</div>
      <div>
        {monthStartDay.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
      </div>
      <div>
        {monthEndDay.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
      </div>
      <div>
        {new Intl.DateTimeFormat("ja-JP", {
          timeZone: "Asia/Tokyo",
          month: "numeric",
        }).format(targetDay)}
      </div>
      <div>
        <Link to="/edit/2024/10">編集</Link>
      </div>
    </div>
  );
};

export default Home;
