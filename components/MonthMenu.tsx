"use client";

import React, { ReactNode, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/infrastructure/firebase";
import { useMonthMenuPresenter } from "../src/presenters/MonthMenuPresenter";
import { MonthMenuService } from "../src/services/MonthMenuService";
import { FirebaseMonthMenuRepository } from "../src/repositories/firebase/MonthMenuRepository";
import { HiTrash } from "react-icons/hi";
import { Menu, OriginalMenu } from "../src/types/Menu";
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

export type MonthMenuRef = {
  refreshData: () => Promise<void>;
};

const MonthMenu = forwardRef<MonthMenuRef, MonthMenuProps>(({
  year,
  month,
  onAddMenu,
  onAddOriginalMenu,
  onDragEnd,
  children,
}, ref) => {
  const [user, setUser] = useState<User | null>(null);

  const {
    menus,
    originalMenus,
    monthlyChangeData,
    loading,
    error,
    addMenu,
    addOriginalMenu,
    removeMenu,
    removeOriginalMenu,
    saveMonthMenuData,
    refreshData,
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

  useImperativeHandle(ref, () => ({
    refreshData,
  }));

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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="w-full h-40">
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-start text-[24px] font-bold">月間共通メニュー</h2>
        </div>

        <div className="border border-[#CCCCCC] rounded-[8px] h-[144px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center rounded-[8px]">
              <span className="text-gray-700 font-medium">
                メニューを読み込み中...
              </span>
            </div>
          )}
          <MonthMenuDroppable
            onAddMenu={handleAddMenu}
            onAddOriginalMenu={handleAddOriginalMenu}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-2 pl-6 pt-3">
              {[0, 1, 2].map((columnIndex) => {
                // 通常メニュー、オリジナルメニュー、変更データを結合
                const changeItems = [
                  ...Object.entries(monthlyChangeData.commonMenuIds).map(([menuId, isAdded]) => ({
                    type: 'change' as const,
                    id: `c-${menuId}`,
                    title: `c-${menuId} ${isAdded ? "(追加)" : "(削除)"}`,
                    isChange: true
                  })),
                  ...Object.entries(monthlyChangeData.originalMenuIds).map(([menuId, isAdded]) => ({
                    type: 'change' as const,
                    id: `c-${menuId}`,
                    title: `c-${menuId} ${isAdded ? "(追加)" : "(削除)"}`,
                    isChange: true
                  }))
                ];
                
                const allItems = [
                  ...menus.map(menu => ({ ...menu, type: 'menu' as const, isChange: false })),
                  ...originalMenus.map(originalMenu => ({ ...originalMenu, type: 'originalMenu' as const, isChange: false })),
                  ...changeItems
                ];
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
                    {displayItems.map((item, index) => (
                      <div
                        key={item.isChange ? item.id : ("item_code" in item ? item.item_code : item.id)}
                        className="flex justify-between items-center text-[10px] relative"
                      >
                        <div className="flex-1 truncate pr-6">
                          {item.title}
                        </div>
                        {!item.isChange && (
                          <div
                            className="text-black cursor-pointer pr-12 hover:text-red-600"
                            onClick={() =>
                              item.type === 'menu'
                                ? handleRemoveMenu((item as any).item_code)
                                : handleRemoveOriginalMenu((item as any).id)
                            }
                          >
                            <HiTrash />
                          </div>
                        )}
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

            {menus.length === 0 && originalMenus.length === 0 && Object.keys(monthlyChangeData.commonMenuIds).length === 0 && Object.keys(monthlyChangeData.originalMenuIds).length === 0 && (
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
});

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
    id: "month-menu",
    data: { type: "monthMenu" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-[8px] ${
        isOver ? "bg-[#D87C7C]" : "bg-white"
      }`}
    >
      {children}
    </div>
  );
};

export default MonthMenu;
