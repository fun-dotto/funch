// import React from "react";
import { useParams } from "react-router-dom";
import { FaChevronDown, FaChevronRight, FaTrashAlt } from "react-icons/fa";
import { FC, ReactNode, useState } from "react";
import { getCategoryMenu, Menu } from "../repository/menu";
import {
  DndContext,
  DragOverlay,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const Edit = () => {
  const { year, month } = useParams();
  const [menuData, setMenuData] = useState(new Map<UniqueIdentifier, Menu[]>());
  const [monthMenuData, setMonthMenuData] = useState<Menu[]>([]);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const categoryOptions = [
    { value: "1", label: "主菜" },
    { value: "2", label: "副菜" },
    { value: "9", label: "サラダ" },
    { value: "4", label: "丼物" },
    { value: "5", label: "カレー" },
    { value: "11", label: "麺類" },
    { value: "7", label: "ごはん" },
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
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
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

  const removeMenu = (date: string, item_code: number) => {
    setMenuData((prev) => {
      const newMenuData = new Map(prev);
      const dateMenu = newMenuData.get(date);
      if (dateMenu != undefined) {
        const newDateMenu = dateMenu.filter((m) => m.item_code != item_code);
        newMenuData.set(date, newDateMenu);
      }
      return newMenuData;
    });
  };

  const removeMonthMenu = (item_code: number) => {
    setMonthMenuData((prev) => {
      return prev.filter((m) => m.item_code != item_code);
    });
  };

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
          if (activeMenu != null) {
            if (over.id == "month") {
              setMonthMenuData((prev) => {
                if (
                  prev.find((m) => m.item_code == activeMenu.item_code) ==
                  undefined
                ) {
                  return [...prev, activeMenu];
                } else {
                  return prev;
                }
              });
            } else {
              setMenuData((prev) => {
                const date = over.id;
                const newMenuData = new Map(prev);
                const dateMenu = newMenuData.get(date);
                if (dateMenu != undefined) {
                  if (
                    dateMenu.find((m) => m.item_code == activeMenu.item_code) ==
                    undefined
                  ) {
                    dateMenu.push(activeMenu);
                    newMenuData.set(date, dateMenu);
                  }
                } else {
                  newMenuData.set(date, [activeMenu]);
                }
                console.log(newMenuData);
                return newMenuData;
              });
            }
          }

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

              {calendar.map((v) => {
                const dateId = new Intl.DateTimeFormat(
                  "ja-JP",
                  dateOptions
                ).format(v);
                const oneDayMenuData = menuData.get(dateId);
                console.log(oneDayMenuData);
                return (
                  <div className="w-full bg-gray-300 border-gray-300 rounded">
                    {v >= monthStartDay && v <= monthEndDay && (
                      <Droppable date={v} id={dateId}>
                        {new Intl.DateTimeFormat("ja-JP", dayOptions).format(v)}
                        <div className="flex flex-col mt-4">
                          {oneDayMenuData &&
                            oneDayMenuData.map((m) => {
                              return (
                                <div className="flex justify-between items-center my-1">
                                  <div>{m.display_name}</div>
                                  <FaTrashAlt
                                    className="cursor-pointer inline text-gray-500"
                                    onClick={() =>
                                      removeMenu(dateId, m.item_code)
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </Droppable>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-12">
              <h3>{monthJST}の共通メニュー</h3>
              <div className="w-2/5">
                <Droppable date={targetDay} id="month">
                  <div className="flex flex-col mt-4">
                    {monthMenuData.map((m) => {
                      return (
                        <div className="flex justify-between items-center my-1">
                          <div>{m.display_name}</div>
                          <FaTrashAlt
                            className="cursor-pointer inline text-gray-500"
                            onClick={() => removeMonthMenu(m.item_code)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Droppable>
              </div>
            </div>
          </div>
        </div>
        <aside className="fixed top-0 right-0 w-96 h-screen bg-white overflow-x-hidden overflow-y-scroll z-10">
          {categoryOptions.map((c) => DraggableByCategory(c))}
        </aside>
        <DragOverlay>
          {activeMenu && <DraggableBlockSource menu={activeMenu} />}
        </DragOverlay>
      </DndContext>
    </>
  );
};

const DraggableByCategory = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  const category_code = Number(value);
  const menus = getCategoryMenu(category_code);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="mx-2 my-4 flex items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        {label}
      </div>

      {open &&
        menus.map((m) => {
          return <Draggable id={String(m.item_code)} menu={m} />;
        })}
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
      className={`z-30 p-2 my-1 mx-4 border rounded text-center bg-white select-none w-fit ${
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
    data: { date },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full min-h-24 p-2 border rounded ${
        isOver ? "bg-green-200" : "bg-gray-200"
      }`}
    >
      {children}
    </div>
  );
};
