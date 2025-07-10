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
import { Menu, OriginalMenu } from "../types/Menu";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activeMenu, setActiveMenu] = useState<Menu | OriginalMenu | null>(
    null
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMenu(null);

    if (!over || !active.data.current?.menu) return;

    const menu = active.data.current.menu;
    const overId = over.id;

    console.log("Dropped menu:", menu);
    console.log("Drop target:", overId);

    // TODO: ドロップ処理の実装
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
                <div className="z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit cursor-grabbing">
                  {activeMenu instanceof Menu ? (
                    <>
                      {activeMenu.title}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.price_medium}
                      </span>
                    </>
                  ) : (
                    <>
                      FUN {activeMenu.title}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.price.medium}
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
