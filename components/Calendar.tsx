"use client";

import React, { ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

type CalendarProps = {
  year: number;
  month: number;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  children?: ReactNode;
  renderDay?: (date: Date, dateId: string) => ReactNode;
  activeItem?: any;
};

const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  onDragStart,
  onDragEnd,
  children,
  renderDay,
  activeItem,
}) => {
  const targetDay = new Date(year, month - 1);
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

  const calendarWeekStr = ["月", "火", "水", "木", "金"];

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="my-2 mx-auto">
        <h2 className="text-start text-[24px] mb-2 font-bold">
          日替わりメニュー
        </h2>
        <div className="grid grid-cols-5 justify-items-stretch text-left gap-1 w-fit">
          {calendarWeekStr.map((v) => (
            <div
              className="min-w-16 bg-[#990000] text-white border-gray-300 rounded-[8px] p-2 text-center text-[16px]"
              key={v}
            >
              {v}
            </div>
          ))}

          {calendar.map((v) => {
            const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(
              v
            );
            const isCurrentMonth = v >= monthStartDay && v <= monthEndDay;
            return (
              <div
                className={
                  isCurrentMonth
                    ? "min-w-16 bg-white border border-[#CCCCCC] rounded-[8px] hover:bg-[#D87C7C] text-[#990000] font-blacks"
                    : "min-w-16 bg-[#3C373C]/35 rounded-[8px]"
                }
                key={dateId}
              >
                {isCurrentMonth ? (
                  <Droppable date={v} id={dateId}>
                    <span className="pl-2 text-[#990000]">
                      {new Intl.DateTimeFormat("ja-JP", dayOptions)
                        .format(v)
                        .replace("日", "")}
                    </span>
                    {renderDay && (
                      <div className="text-black pl-2">
                        {renderDay(v, dateId)}
                      </div>
                    )}
                  </Droppable>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeItem && <DraggableBlockSource item={activeItem} />}
      </DragOverlay>
      {children}
    </DndContext>
  );
};

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
      className={`w-full h-full min-h-24 p-2 rounded ${
        isOver ? "bg-green-200" : ""
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
