"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import Calendar from "@/components/Calendar";
import MonthMenu from "@/components/MonthMenu";
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
  const [isDropSuccess, setIsDropSuccess] = useState(false);
  const changeMenuService = new ChangeMenuService();

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.menu) {
      setActiveMenu(active.data.current.menu);
      setIsDropSuccess(false);
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
        
        setIsDropSuccess(true);
        
        // フェードアウト開始後にFirestore保存
        setTimeout(async () => {
          await changeMenuService.saveDailyChange(targetDate, menu);
          console.log(`Daily change saved for ${overId}:`, menu.name);
        }, 50);
        
        // フェードアウト完了後にアイテムを消去
        setTimeout(() => {
          setActiveMenu(null);
          setIsDropSuccess(false);
        }, 400);
      }
      // 月間メニューへのドロップの場合
      else if (overId === "month-menu") {
        setIsDropSuccess(true);
        
        // フェードアウト開始後にFirestore保存
        setTimeout(async () => {
          await changeMenuService.saveMonthlyChange(currentYear, currentMonth, menu);
          console.log(`Monthly change saved for ${currentYear}/${currentMonth}:`, menu.name);
        }, 50);
        
        // フェードアウト完了後にアイテムを消去
        setTimeout(() => {
          setActiveMenu(null);
          setIsDropSuccess(false);
        }, 400);
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
                    <MonthMenu year={currentYear} month={currentMonth} />
                  </div>
                  <Calendar year={currentYear} month={currentMonth} />
                </div>
              </div>
              <div className="flex-1">
                <SettingTab />
              </div>
            </div>
            <DragOverlay>
              {activeMenu && (
                <div 
                  className={`z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit cursor-grabbing transition-opacity duration-300 ${
                    isDropSuccess ? 'opacity-0' : 'opacity-100'
                  }`}
                >
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
