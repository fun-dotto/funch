"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import Calendar, { CalendarRef } from "@/components/Calendar";
import MonthMenu, { MonthMenuRef } from "@/components/MonthMenu";
import { YearMonthDisplay } from "@/components/Date";
import SettingTab from "@/components/SettingTab";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { MenuItem } from "../types/Menu";
import { ChangeMenuService } from "../services/ChangeMenuService";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const changeMenuService = new ChangeMenuService();
  const calendarRef = useRef<CalendarRef>(null);
  const monthMenuRef = useRef<MonthMenuRef>(null);

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.menu) {
      setActiveMenu(active.data.current.menu);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current?.menu) {
      setActiveMenu(null);
      return;
    }

    const menu = active.data.current.menu as MenuItem;
    const overId = over.id as string;

    console.log("Dropped menu:", menu);
    console.log("Drop target:", overId);

    try {
      // カレンダーへのドロップの場合
      if (overId.includes("/")) {
        // overId形式: "2025/07/15" など
        const [year, month, day] = overId.split("/").map(Number);
        const targetDate = new Date(year, month - 1, day);

        // Firestore保存
        await changeMenuService.saveDailyChange(targetDate, menu);
        console.log(`Daily change saved for ${overId}:`, menu.name);

        // カレンダーデータのみを更新
        await calendarRef.current?.refreshData();

        // 即座に非表示にする
        setActiveMenu(null);
      }
      // 月間メニューへのドロップの場合
      else if (overId === "month-menu") {
        // Firestore保存
        await changeMenuService.saveMonthlyChange(
          currentYear,
          currentMonth,
          menu
        );
        console.log(
          `Monthly change saved for ${currentYear}/${currentMonth}:`,
          menu.name
        );
        
        // 月間メニューデータのみを更新
        await monthMenuRef.current?.refreshData();
        
        // 即座に非表示にする
        setActiveMenu(null);
      } else {
        // ドロップ失敗
        setActiveMenu(null);
      }
    } catch (error) {
      console.error("Failed to save change:", error);
      setActiveMenu(null);
    }
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
      <main className="flex-1 overflow-y-auto p-8">
        {user ? (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-row gap-8 h-full">
              <div className="flex flex-col">
                <div>
                  <div className="flex gap-6">
                    <YearMonthDisplay
                      year={currentYear}
                      month={currentMonth}
                      onYearMonthChange={handleYearMonthChange}
                    />
                    <MonthMenu ref={monthMenuRef} year={currentYear} month={currentMonth} />
                  </div>
                  <Calendar ref={calendarRef} year={currentYear} month={currentMonth} />
                </div>
              </div>
              <div className="flex-1">
                <SettingTab />
              </div>
            </div>
            <DragOverlay>
              {activeMenu && (
                <div className="z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit cursor-grabbing">
                  {typeof activeMenu.id === "number" ? (
                    <>
                      {activeMenu.name}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.prices.medium}
                      </span>
                    </>
                  ) : (
                    <>
                      FUN {activeMenu.name}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.prices.medium}
                      </span>
                    </>
                  )}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div>
            <p>ログインしてください</p>
          </div>
        )}
      </main>
    </div>
  );
}
