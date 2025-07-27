"use client";

import React from "react";
import { DisplayMenuItem } from "./MenuItemList";
import { MenuItemList } from "./MenuItemList";
import { Button } from "./ui/button";

type RemainingMenuDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  items: DisplayMenuItem[];
  onDeleteMenu: (menuItemCode: number) => Promise<void>;
  onDeleteOriginalMenu: (originalMenuId: string) => Promise<void>;
  onRevertChange: (menuId: string, isCommonMenu: boolean) => Promise<void>;
  title?: string;
};

export const RemainingMenuDialog: React.FC<RemainingMenuDialogProps> = ({
  isOpen,
  onClose,
  items,
  onDeleteMenu,
  onDeleteOriginalMenu,
  onRevertChange,
  title = "月間共通メニュー",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[30%]">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="overflow-y-auto rounded-lg p-4">
          <MenuItemList
            items={items}
            onDeleteMenu={onDeleteMenu}
            onDeleteOriginalMenu={onDeleteOriginalMenu}
            onRevertChange={onRevertChange}
            variant="monthMenu"
          />

          {items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              メニューがありません
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="destructive"
            className="bg-white text-[#990000] border border-[#D87C7C] hover:bg-[#D87C7C]"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
};
