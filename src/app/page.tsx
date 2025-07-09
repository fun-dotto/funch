"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import { YearMonthDisplay } from "../../components/Date";
import Calendar from "@/components/Calendar";
import { useCalendarMenuPresenter } from "../presenters/CalendarPresenter";
import { CalendarMenuService } from "../services/CalendarService";
import { FirebaseCalendarMenuRepository } from "../repositories/CalendarRepository";

const calendarMenuRepository = new FirebaseCalendarMenuRepository();
const calendarMenuService = new CalendarMenuService(calendarMenuRepository);

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const { menuData, originalMenuData, loading } = useCalendarMenuPresenter(
    user,
    currentYear,
    currentMonth,
    calendarMenuService
  );

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
          <Calendar
            year={currentYear}
            month={currentMonth}
            renderDay={(_, dateId) => {
              const oneDayMenuData = menuData.get(dateId);
              const oneDayOriginalMenuData = originalMenuData.get(dateId);
              return (
                <div className="flex flex-col mt-2">
                  {oneDayMenuData &&
                    oneDayMenuData.map((m) => (
                      <div
                        key={m.item_code}
                        className="flex justify-between items-center my-1 text-xs"
                      >
                        <div>{m.title}</div>
                      </div>
                    ))}
                  {oneDayOriginalMenuData &&
                    oneDayOriginalMenuData.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between items-center my-1 text-xs"
                      >
                        <div>FUN {m.title}</div>
                      </div>
                    ))}
                </div>
              );
            }}
          />
          {loading && (
            <div className="absolute w-screen h-screen top-0 left-0 bg-gray-500 bg-opacity-50 z-50">
              <div className="absolute w-screen h-screen grid items-center text-center text-2xl">
                loading...
              </div>
            </div>
          )}
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
