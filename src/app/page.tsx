"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import Calendar from "@/components/Calendar";
import MonthMenu from "@/components/MonthMenu";
import { YearMonthDisplay } from "@/components/Date";
import SettingTab from "@/components/SettingTab";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

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

  return (
    <div className="bg-[#eee] w-screen h-screen flex flex-col">
      <Header />
      <main className="overflow-y-auto p-6">
        {user ? (
          <div className="flex flex-row gap-8 h-full">
            <div className="flex flex-col">
              <div>
                <div className="flex gap-6">
                  <YearMonthDisplay
                    year={currentYear}
                    month={currentMonth}
                    onYearMonthChange={handleYearMonthChange}
                  />
                  <MonthMenu year={currentYear} month={currentMonth} />
                </div>
                <Calendar year={currentYear} month={currentMonth} />
              </div>
            </div>
            <div className="flex-1">
              <SettingTab />
            </div>
          </div>
        ) : (
          <div>
            <p>ログインしてください</p>
          </div>
        )}
      </main>
    </div>
  );
}
