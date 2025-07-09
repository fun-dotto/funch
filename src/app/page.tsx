"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import { YearMonthDisplay } from "../../components/Date";
import Calendar from "@/components/Calendar";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <div className="view bg-[#eee] min-h-full min-w-full">
      <Header />
      {user ? (
        // ログインしている場合の表示
        <div className="ml-4 md:ml-8 mt-12 md:mt-[60px]">
          <YearMonthDisplay
            year={currentYear}
            month={currentMonth}
            onYearMonthChange={handleYearMonthChange}
          />
          <Calendar year={currentYear} month={currentMonth} />
        </div>
      ) : (
        // ログインしていない場合の表示
        <div>
          <p>ログインしてください</p>
        </div>
      )}
    </div>
  );
}
