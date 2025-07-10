"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/infrastructure/firebase";
import { useMonthMenuPresenter } from "../src/presenters/MonthMenuPresenter";
import { MonthMenuService } from "../src/services/MonthMenuService";
import { FirebaseMonthMenuRepository } from "../src/repositories/FirebaseMonthMenuRepository";
import { HiTrash } from "react-icons/hi";
import { Menu, OriginalMenu } from "../src/repository/menu";
import { useDroppable } from "@dnd-kit/core";

const monthMenuRepository = new FirebaseMonthMenuRepository();
const monthMenuService = new MonthMenuService(monthMenuRepository);

type MonthMenuProps = {
  year: number;
  month: number;
  onAddMenu?: (menu: Menu) => void;
  onAddOriginalMenu?: (originalMenu: OriginalMenu) => void;
  onDragEnd?: (event: any) => void;
  children?: ReactNode;
};

const MonthMenu: React.FC<MonthMenuProps> = ({
  year,
  month,
  onAddMenu,
  onAddOriginalMenu,
  onDragEnd,
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const {
    menus,
    originalMenus,
    loading,
    error,
    addMenu,
    addOriginalMenu,
    removeMenu,
    removeOriginalMenu,
    saveMonthMenuData,
  } = useMonthMenuPresenter(user, year, month, monthMenuService);

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

  const handleAddMenu = (menu: Menu) => {
    addMenu(menu);
    if (onAddMenu) {
      onAddMenu(menu);
    }
  };

  const handleAddOriginalMenu = (originalMenu: OriginalMenu) => {
    addOriginalMenu(originalMenu);
    if (onAddOriginalMenu) {
      onAddOriginalMenu(originalMenu);
    }
  };

  const handleRemoveMenu = async (menuItemCode: number) => {
    if (window.confirm("このメニューを削除しますか？")) {
      await removeMenu(menuItemCode);
    }
  };

  const handleRemoveOriginalMenu = async (originalMenuId: string) => {
    if (window.confirm("このオリジナルメニューを削除しますか？")) {
      await removeOriginalMenu(originalMenuId);
    }
  };

  const handleSave = async () => {
    if (window.confirm("月間メニューを保存しますか？")) {
      await saveMonthMenuData();
    }
  };

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#990000]"></div>
              <span className="text-gray-700 font-medium">
                メニューを読み込み中...
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="w-full h-40">
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-start text-[24px] font-bold">月間共通メニュー</h2>
        </div>

        <div className="border border-[#CCCCCC] rounded-[8px] h-[144px]">
          <MonthMenuDroppable
            onAddMenu={handleAddMenu}
            onAddOriginalMenu={handleAddOriginalMenu}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-2 pl-6 pt-3">
              {[0, 1, 2].map((columnIndex) => {
                const allItems = [...menus, ...originalMenus];
                const totalItems = allItems.length;
                const startIndex = columnIndex * 8;
                const endIndex = (columnIndex + 1) * 8;
                const columnItems = allItems.slice(startIndex, endIndex);

                // 23件目まで表示し、24件目に「他X件」を表示
                const shouldShowMore =
                  totalItems > 23 && startIndex + columnItems.length > 23;
                const displayItems = shouldShowMore
                  ? columnItems.slice(0, 23 - startIndex)
                  : columnItems;
                const remainingCount = totalItems - 23;

                return (
                  <div key={columnIndex} className="w-full flex flex-col">
                    {displayItems.map((menu, index) => (
                      <div
                        key={"item_code" in menu ? menu.item_code : menu.id}
                        className="flex justify-between items-center text-[10px] relative"
                      >
                        <div className="flex-1 truncate pr-6">
                          {"item_code" in menu ? menu.title : menu.title}
                        </div>
                        <div
                          className="text-black cursor-pointer pr-20 hover:text-red-600"
                          onClick={() =>
                            "item_code" in menu
                              ? handleRemoveMenu(menu.item_code)
                              : handleRemoveOriginalMenu(menu.id)
                          }
                        >
                          <HiTrash />
                        </div>
                      </div>
                    ))}

                    {/* 「他X件」の表示 */}
                    {shouldShowMore &&
                      startIndex <= 23 &&
                      startIndex + displayItems.length === 23 && (
                        <div className="flex justify-center items-center text-[10px] text-gray-600 py-1">
                          他{remainingCount}件
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {menus.length === 0 && originalMenus.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                メニューがありません
                <br />
                右側からメニューをドラッグして追加してください
              </div>
            )}
          </MonthMenuDroppable>
        </div>
      </div>

      {children}
    </div>
  );
};

type MonthMenuDroppableProps = {
  onAddMenu: (menu: Menu) => void;
  onAddOriginalMenu: (originalMenu: OriginalMenu) => void;
  onDragEnd?: (event: any) => void;
  children: ReactNode;
};

const MonthMenuDroppable: React.FC<MonthMenuDroppableProps> = ({
  onAddMenu,
  onAddOriginalMenu,
  onDragEnd,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "monthMenu",
    data: { type: "monthMenu" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-[8px] ${
        isOver ? "bg-[#D87C7C]/20" : "bg-white"
      }`}
    >
      {children}
    </div>
  );
};

export default MonthMenu;
