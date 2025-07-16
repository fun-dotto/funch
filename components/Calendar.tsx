"use client";

import React, {
  ReactNode,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/infrastructure/firebase";
import { useCalendarMenuPresenter } from "../src/presenters/CalendarPresenter";
import { CalendarMenuService } from "../src/services/CalendarService";
import { FirebaseCalendarMenuRepository } from "../src/repositories/firebase/CalendarRepository";
import { HiTrash } from "react-icons/hi";

const calendarMenuRepository = new FirebaseCalendarMenuRepository();
const calendarMenuService = new CalendarMenuService(calendarMenuRepository);

type CalendarProps = {
  year?: number;
  month?: number;
  children?: ReactNode;
};

export type CalendarRef = {
  refreshData: () => Promise<void>;
  refreshSingleDayChange: (date: Date) => Promise<void>; // 🚀 最適化関数
};

const Calendar = forwardRef<CalendarRef, CalendarProps>(
  ({ year, month, children }, ref) => {
    const [user, setUser] = useState<User | null>(null);
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const {
      menuData,
      originalMenuData,
      changeData,
      loading,
      deleteDailyMenu,
      deleteDailyOriginalMenu,
      refreshData,
      refreshSingleDayChange,
      getMenuNameById,
    } = useCalendarMenuPresenter(
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

    useImperativeHandle(ref, () => ({
      refreshData,
      refreshSingleDayChange, // 🚀 最適化関数を公開
    }));

    const targetDay = new Date(currentYear, currentMonth - 1);
    const monthStartDay = new Date(targetDay);
    monthStartDay.setDate(1);
    const monthEndDay = new Date(targetDay);
    monthEndDay.setMonth(targetDay.getMonth() + 1, 0);

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    const dayOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      day: "numeric",
    };

    const calendar: Date[] = [];
    const calendarStartDate = new Date(monthStartDay);
    calendarStartDate.setDate(
      1 + monthStartDay.getDay() == 0 ? -6 : 1 - monthStartDay.getDay()
    );
    let i = 0;
    for (i = 0; i < 7 * 5; i++) {
      const pushDate = new Date(calendarStartDate);
      pushDate.setDate(pushDate.getDate() + i);
      if (pushDate.getDay() > 0 && pushDate.getDay() < 6) {
        calendar.push(pushDate);
      }
    }
    const checkDate = new Date(calendarStartDate);
    checkDate.setDate(checkDate.getDate() + i);
    if (checkDate <= monthEndDay) {
      for (; i < 7 * 6; i++) {
        const pushDate = new Date(calendarStartDate);
        pushDate.setDate(pushDate.getDate() + i);
        if (pushDate.getDay() > 0 && pushDate.getDay() < 6) {
          calendar.push(pushDate);
        }
      }
    }

    // 行ごとにカレンダーを分割
    const calendarRows: Date[][] = [];
    for (let i = 0; i < calendar.length; i += 5) {
      calendarRows.push(calendar.slice(i, i + 5));
    }

    const calendarWeekStr = ["月", "火", "水", "木", "金"];

    const renderDay = (date: Date, dateId: string) => {
      const oneDayMenuData = menuData.get(dateId);
      const oneDayOriginalMenuData = originalMenuData.get(dateId);
      const oneDayChangeData = changeData.get(dateId);

      const handleDeleteMenu = async (menuItemCode: number) => {
        if (window.confirm("このメニューを削除しますか？")) {
          await deleteDailyMenu(date, menuItemCode);
        }
      };

      const handleDeleteOriginalMenu = async (originalMenuId: string) => {
        if (window.confirm("このオリジナルメニューを削除しますか？")) {
          await deleteDailyOriginalMenu(date, originalMenuId);
        }
      };

      // 優先順位に従って表示項目を管理
      const displayItems: JSX.Element[] = [];
      const displayedIds = new Set<string>();

      // 1. 優先順位最高：change false（削除）
      if (oneDayChangeData) {
        // commonMenuIds の false
        Object.entries(oneDayChangeData.commonMenuIds).forEach(
          ([menuId, isAdded]) => {
            if (!isAdded) {
              displayItems.push(
                <div
                  key={`c-${menuId}`}
                  className="flex justify-between items-center text-xs relative bg-red-100"
                >
                  <div className="flex-1 truncate pr-6">
                    {getMenuNameById(menuId)} (削除)
                  </div>
                  <div className="text-black cursor-pointer absolute right-2 hover:text-red-600">
                    <HiTrash />
                  </div>
                </div>
              );
              displayedIds.add(menuId);
            }
          }
        );

        // originalMenuIds の false
        Object.entries(oneDayChangeData.originalMenuIds).forEach(
          ([menuId, isAdded]) => {
            if (!isAdded) {
              displayItems.push(
                <div
                  key={`c-${menuId}`}
                  className="flex justify-between items-center text-xs relative bg-red-100"
                >
                  <div className="flex-1 truncate pr-6">
                    {getMenuNameById(menuId)} (削除)
                  </div>
                  <div className="text-black cursor-pointer absolute right-2 hover:text-red-600">
                    <HiTrash />
                  </div>
                </div>
              );
              displayedIds.add(menuId);
            }
          }
        );
      }

      // 2. 中優先：普通のmenu（重複除く）
      if (oneDayMenuData) {
        oneDayMenuData.forEach((m) => {
          if (!displayedIds.has(m.item_code.toString())) {
            displayItems.push(
              <div
                key={m.item_code}
                className="flex justify-between items-center my-1 text-xs relative"
              >
                <div className="flex-1 truncate pr-6">{m.title}</div>
                <div
                  className="text-black cursor-pointer absolute right-2 hover:text-red-600"
                  onClick={() => handleDeleteMenu(m.item_code)}
                >
                  <HiTrash />
                </div>
              </div>
            );
            displayedIds.add(m.item_code.toString());
          }
        });
      }

      if (oneDayOriginalMenuData) {
        oneDayOriginalMenuData.forEach((m) => {
          if (!displayedIds.has(m.id)) {
            displayItems.push(
              <div
                key={m.id}
                className="flex justify-between items-center my-1 text-xs relative"
              >
                <div className="flex-1 truncate pr-6">{m.title}</div>
                <div
                  className="text-black cursor-pointer absolute right-2 hover:text-red-600"
                  onClick={() => handleDeleteOriginalMenu(m.id)}
                >
                  <HiTrash />
                </div>
              </div>
            );
            displayedIds.add(m.id);
          }
        });
      }

      // 3. 低優先：change true（追加）（重複除く）
      if (oneDayChangeData) {
        // commonMenuIds の true
        Object.entries(oneDayChangeData.commonMenuIds).forEach(
          ([menuId, isAdded]) => {
            if (isAdded && !displayedIds.has(menuId)) {
              displayItems.push(
                <div
                  key={`c-${menuId}`}
                  className="flex justify-between items-center text-xs relative bg-green-100"
                >
                  <div className="flex-1 truncate pr-6">
                    {getMenuNameById(menuId)} (追加)
                  </div>
                  <div className="text-black cursor-pointer absolute right-2 hover:text-red-600">
                    <HiTrash />
                  </div>
                </div>
              );
              displayedIds.add(menuId);
            }
          }
        );

        // originalMenuIds の true
        Object.entries(oneDayChangeData.originalMenuIds).forEach(
          ([menuId, isAdded]) => {
            if (isAdded && !displayedIds.has(menuId)) {
              displayItems.push(
                <div
                  key={`c-${menuId}`}
                  className="flex justify-between items-center text-xs relative bg-green-100"
                >
                  <div className="flex-1 truncate pr-6">
                    {getMenuNameById(menuId)} (追加)
                  </div>
                  <div className="text-black cursor-pointer absolute right-2 hover:text-red-600">
                    <HiTrash />
                  </div>
                </div>
              );
              displayedIds.add(menuId);
            }
          }
        );
      }

      return <div className="flex flex-col">{displayItems}</div>;
    };

    return (
      <div className="">
        {/* Date component removed - now handled in page.tsx */}
        <div>
          <div className="my-2 mx-auto">
            <h2 className="text-start text-[24px] mb-2 font-bold">
              日替わりメニュー
            </h2>
            <div className="w-[1000px] relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    メニューを読み込み中...
                  </span>
                </div>
              )}
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-5 justify-items-stretch text-left gap-1 mb-1">
                {calendarWeekStr.map((v) => (
                  <div
                    className="w-[196px] bg-[#990000] text-white h-8 border-gray-300 rounded-[8px] flex items-center justify-center text-[16px]"
                    key={v}
                  >
                    {v}
                  </div>
                ))}
              </div>

              {/* 各行 */}
              {calendarRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-5 justify-items-stretch text-left gap-1 mb-1 items-stretch"
                >
                  {row.map((v) => {
                    const dateId = new Intl.DateTimeFormat(
                      "ja-JP",
                      dateOptions
                    ).format(v);
                    const isCurrentMonth =
                      v >= monthStartDay && v <= monthEndDay;
                    return (
                      <div
                        className={
                          isCurrentMonth
                            ? "w-[196px] min-h-[98px] bg-white border border-[#CCCCCC] rounded-[8px] text-[#990000] font-blacks"
                            : "w-[196px] min-h-[98px] bg-[#3C373C]/35 rounded-[8px]"
                        }
                        key={dateId}
                      >
                        {isCurrentMonth ? (
                          <Droppable date={v} id={dateId}>
                            <span className="pl-2 text-[#990000] font-bold">
                              {new Intl.DateTimeFormat("ja-JP", dayOptions)
                                .format(v)
                                .replace("日", "")}
                            </span>
                            {renderDay && (
                              <div className="text-black pl-2 pr-2 overflow-hidden items-start relative">
                                <div className="w-full break-words">
                                  {renderDay(v, dateId)}
                                </div>
                              </div>
                            )}
                          </Droppable>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }
);

type DroppableProps = {
  date: Date;
  children: ReactNode;
  id: string;
};

const Droppable: React.FC<DroppableProps> = ({ date, children, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full min-h-24 p-2 rounded flex flex-col ${
        isOver ? "bg-[#D87C7C]" : ""
      }`}
    >
      {children}
    </div>
  );
};

type DraggableBlockSourceProps = {
  item: any;
  isDragging?: boolean;
};

const DraggableBlockSource: React.FC<DraggableBlockSourceProps> = ({
  item,
  isDragging,
}) => {
  return (
    <div
      className={`z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {item?.title || "Item"}
    </div>
  );
};

type DraggableProps = {
  id: string;
  item: any;
  children?: ReactNode;
};

export const Draggable: React.FC<DraggableProps> = ({ id, item, children }) => {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { item },
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="z-20 h-fit">
      {children || <DraggableBlockSource item={item} isDragging={isDragging} />}
    </div>
  );
};

export default Calendar;
