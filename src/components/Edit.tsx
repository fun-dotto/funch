// import React from "react";
import { useParams } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { FC, ReactNode, useState } from "react";
import { getCategoryMenu, importMenu, Menu } from "../repository/menu";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const Edit = () => {
  const { year, month } = useParams();
  const [menuData, setMenuData] = useState(new Map<Date, Menu[]>());
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const categoryOptions = [
    { value: "1", label: "主菜" },
    { value: "2", label: "副菜・サラダ" },
    { value: "4", label: "丼物・カレー" },
    { value: "11", label: "麺類" },
    { value: "8", label: "汁物" },
    { value: "10", label: "デザート" },
  ];
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

  const calendarWeekStr = ["月", "火", "水", "木", "金"];

  return (
    <>
      <DndContext
        onDragStart={(event) => {
          const { active } = event;
          if (active == null) {
            return;
          }
          console.log(active);
          if (active.data.current != null) {
            setActiveMenu(() => active.data.current!.menu);
          }
        }}
        onDragEnd={(event) => {
          const { over } = event;
          if (over == null) {
            return;
          }
          console.log(over);
          setActiveMenu(() => null);
        }}
      >
        <div className="sm:mr-96 z-10">
          <h2>
            {yearJST}
            {monthJST}
          </h2>
          <div className="my-2 mx-auto">
            <div className="grid grid-cols-5 justify-items-stretch text-left gap-0.5">
              {calendarWeekStr.map((v) => (
                <div className="w-full bg-gray-200 border-gray-300 rounded p-2 text-center">
                  {v}
                </div>
              ))}

              {calendar.map((v) => (
                <div className="w-full bg-gray-200 border-gray-300 rounded p-2">
                  {v >= monthStartDay && v <= monthEndDay && (
                    <Droppable date={v} id={v.toISOString().split("T")[0]}>
                      {new Intl.DateTimeFormat("ja-JP", dayOptions).format(v)}
                      <div className="flex items-center">
                        {/* <SelectMenu /> */}
                      </div>
                    </Droppable>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-12">
              <h3>{monthJST}の共通メニュー</h3>
            </div>
          </div>
        </div>
        <aside className="fixed top-0 right-0 w-96 h-screen bg-white overflow-x-hidden overflow-y-scroll z-10">
          {importMenu().map((m) => {
            return <Draggable id={String(m.item_code)} menu={m} />;
          })}
        </aside>
        <DragOverlay>
          {activeMenu && <DraggableBlockSource menu={activeMenu} />}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Edit;

type DraggableBlockSourceType = {
  isDragging?: boolean;
  menu: Menu;
};

export const DraggableBlockSource: FC<DraggableBlockSourceType> = ({
  isDragging,
  menu,
}) => {
  return (
    <div
      className={`z-30 p-2 m-1 border rounded text-center bg-white select-none w-fit ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {menu.display_name}
    </div>
  );
};

type DraggableProps = {
  id: string;
  menu: Menu;
};

export const Draggable: FC<DraggableProps> = ({ id, menu }) => {
  // useDraggableを使って必要な値をもらう
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { menu },
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="z-20 h-fit">
      <DraggableBlockSource isDragging={isDragging} menu={menu} />
    </div>
  );
};

type DroppableProp = {
  date: Date;
  children: ReactNode;
  id: string;
};

export const Droppable: FC<DroppableProp> = ({ date, children, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-20 border ${isOver ? "bg-gray-500" : "bg-white"}`}
    >
      {children}
    </div>
  );
};
