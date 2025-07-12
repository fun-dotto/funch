"use client";

import { FC, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useDraggable } from "@dnd-kit/core";
import { MenuItem } from "../src/types/Menu";
import { useMenuListPresenter } from "../src/presenters/MenuListPresenter";

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

type MenuListProps = {
  className?: string;
};

export const MenuList: FC<MenuListProps> = ({ className = "" }) => {
  const { originalMenuItems, loading, error, getCategoryMenus } =
    useMenuListPresenter();

  if (loading) {
    return (
      <div className={`${className} bg-white`}>
        <div className="p-4 text-center">メニューを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-white`}>
        <div className="p-4 text-center text-red-500">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-white overflow-x-hidden overflow-y-scroll`}
    >
      {categoryOptions.map((category) => (
        <DraggableByCategory
          key={category.value}
          category={category}
          menus={getCategoryMenus(Number(category.value))}
        />
      ))}
      <DraggableOriginal menus={originalMenuItems} />
    </div>
  );
};

type DraggableByCategoryProps = {
  category: { value: string; label: string };
  menus: MenuItem[];
};

const DraggableByCategory: FC<DraggableByCategoryProps> = ({
  category,
  menus,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="mx-2 my-4 flex items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        {category.label}
      </div>
      {open &&
        menus.map((menu) => (
          <Draggable key={String(menu.id)} id={String(menu.id)} menu={menu} />
        ))}
    </>
  );
};

type DraggableOriginalProps = {
  menus: MenuItem[];
};

const DraggableOriginal: FC<DraggableOriginalProps> = ({ menus }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="mx-2 my-4 flex items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        未来大オリジナル
      </div>
      {open &&
        menus.map((menu) => (
          <Draggable key={String(menu.id)} id={String(menu.id)} menu={menu} />
        ))}
    </>
  );
};

type DraggableBlockSourceProps = {
  isDragging?: boolean;
  menu: MenuItem;
};

const DraggableBlockSource: FC<DraggableBlockSourceProps> = ({
  isDragging,
  menu,
}) => {
  return (
    <div
      className={`z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {typeof menu.id === "string" ? (
        <>
          FUN {menu.name}
          <span className="text-xs ml-2">¥{menu.prices.medium}</span>
        </>
      ) : (
        <>
          {menu.name}
          <span className="text-xs ml-2">¥{menu.prices.medium}</span>
        </>
      )}
    </div>
  );
};

type DraggableProps = {
  id: string;
  menu: MenuItem;
};

const Draggable: FC<DraggableProps> = ({ id, menu }) => {
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
