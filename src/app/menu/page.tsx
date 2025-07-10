"use client";

import { MenuList } from "../../../components/MenuList";
import { OriginalMenuList } from "../../../components/OriginalMenuList";
import { DndContext } from "@dnd-kit/core";

export default function MenuPage() {
  return (
    <div className="w-screen h-screen p-4">
      <div className="flex gap-4 h-full">
        <div className="w-1/2">
          <h1 className="text-2xl mb-4">������</h1>
          <DndContext>
            <MenuList className="w-full h-full border border-gray-300 rounded" />
          </DndContext>
        </div>

        <div className="w-1/2">
          <h1 className="text-2xl mb-4">����������</h1>
          <OriginalMenuList className="w-full h-full border border-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
