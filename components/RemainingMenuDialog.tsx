"use client";

import React from "react";
import { DisplayMenuItem } from "./MenuItemList";
import { MenuItemList } from "./MenuItemList";

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
  title = "残りのメニュー",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 text-xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[65vh] bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="border border-gray-200 bg-white rounded-lg p-3 hover:shadow-md transition-shadow duration-200"
              >
                <MenuItemList
                  items={[item]}
                  onDeleteMenu={onDeleteMenu}
                  onDeleteOriginalMenu={onDeleteOriginalMenu}
                  onRevertChange={onRevertChange}
                  variant="monthMenu"
                />
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              メニューがありません
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
