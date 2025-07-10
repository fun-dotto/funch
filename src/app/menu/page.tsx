"use client";

import { MenuList } from "../../../components/MenuList";
import { DndContext } from "@dnd-kit/core";

export default function MenuPage() {
  return (
    <DndContext>
      <div className="w-screen h-screen p-4">
        <h1 className="text-2xl mb-4">メニューリスト</h1>
        <MenuList className="w-96 h-full border border-gray-300" />
      </div>
    </DndContext>
  );
}