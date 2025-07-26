"use client";

import React, {
  ReactNode,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/infrastructure/firebase";
import { useMonthMenuPresenter } from "../src/presenters/MonthMenuPresenter";
import { MonthMenuService } from "../src/services/MonthMenuService";
import { FirebaseMonthMenuRepository } from "../src/repositories/firebase/MonthMenuRepository";
import { Menu, OriginalMenu } from "../src/types/Menu";
import { useDroppable } from "@dnd-kit/core";
import { MenuItemList, DisplayMenuItem } from "./MenuItemList";
import { ChangeMenuService } from "../src/services/ChangeMenuService";

const monthMenuRepository = new FirebaseMonthMenuRepository();
const monthMenuService = new MonthMenuService(monthMenuRepository);
const changeMenuService = new ChangeMenuService();

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
  refreshMonthlyChangeOnly: () => Promise<void>; // 🚀 最適化関数
  refreshAllMenusData: () => Promise<void>; // 🚀 メニューデータ再取得
  getCurrentData: () => {
    menus: any[];
    originalMenus: any[];
    monthlyChangeData: any;
  }; // 🚀 データ取得
};

const MonthMenu = forwardRef<MonthMenuRef, MonthMenuProps>(
  ({ year, month, onAddMenu, onAddOriginalMenu, onDragEnd, children }, ref) => {
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
      refreshMonthlyChangeOnly,
      refreshAllMenusData,
      getMenuNameById,
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
      refreshMonthlyChangeOnly, // 🚀 最適化関数を公開
      refreshAllMenusData, // 🚀 メニューデータ再取得を公開
      getCurrentData: () => ({
        menus,
        originalMenus,
        monthlyChangeData,
      }),
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
      await removeMenu(menuItemCode);
    };

    const handleRemoveOriginalMenu = async (originalMenuId: string) => {
      await removeOriginalMenu(originalMenuId);
    };

    const handleRevertChange = async (
      menuId: string,
      isCommonMenu: boolean
    ) => {
      await changeMenuService.removeMonthlyChangeEntry(
        year,
        month,
        menuId,
        !isCommonMenu
      );
      await refreshMonthlyChangeOnly();
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
            <h2 className="text-start text-[24px] font-bold">
              月間共通メニュー
            </h2>
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
              <div className="flex pl-6 pt-3 pr-3">
                {[0, 1, 2].map((columnIndex) => {
                  // 🚀 すべてのメニューアイテムを集めてからソート（カレンダーと同じ方式）
                  const allMenuItems: DisplayMenuItem[] = [];
                  const displayedIds = new Set<string>();

                  // 1. 通常の共通メニュー
                  menus.forEach((menu) => {
                    const menuIdStr = menu.item_code.toString();
                    // 削除された場合は削除状態として表示
                    if (monthlyChangeData.commonMenuIds[menuIdStr] === false) {
                      allMenuItems.push({
                        id: `c-${menuIdStr}`,
                        title: `${menu.title} (削除)`,
                        type: "deleted",
                        itemCode: menu.item_code,
                        isChange: true,
                        isAdded: false,
                      });
                    } else {
                      allMenuItems.push({
                        id: menuIdStr,
                        title: menu.title,
                        type: "normal",
                        itemCode: menu.item_code,
                        isChange: false,
                      });
                    }
                    displayedIds.add(menuIdStr);
                  });

                  // 2. 通常のオリジナルメニュー
                  originalMenus.forEach((originalMenu) => {
                    // 削除された場合は削除状態として表示
                    if (monthlyChangeData.originalMenuIds[originalMenu.id] === false) {
                      allMenuItems.push({
                        id: `c-${originalMenu.id}`,
                        title: `${originalMenu.title} (削除)`,
                        type: "deleted",
                        originalId: originalMenu.id,
                        isChange: true,
                        isAdded: false,
                      });
                    } else {
                      allMenuItems.push({
                        id: originalMenu.id,
                        title: originalMenu.title,
                        type: "normal",
                        originalId: originalMenu.id,
                        isChange: false,
                      });
                    }
                    displayedIds.add(originalMenu.id);
                  });

                  // 3. 追加されたメニュー（共通メニュー）
                  Object.entries(monthlyChangeData.commonMenuIds).forEach(
                    ([menuId, isAdded]) => {
                      if (isAdded && !displayedIds.has(menuId)) {
                        allMenuItems.push({
                          id: `c-${menuId}`,
                          title: `${getMenuNameById(menuId)} (追加)`,
                          type: "added",
                          itemCode: parseInt(menuId, 10) || undefined,
                          isChange: true,
                          isAdded: isAdded,
                        });
                        displayedIds.add(menuId);
                      }
                    }
                  );

                  // 4. 追加されたメニュー（オリジナルメニュー）
                  Object.entries(monthlyChangeData.originalMenuIds).forEach(
                    ([menuId, isAdded]) => {
                      if (isAdded && !displayedIds.has(menuId)) {
                        allMenuItems.push({
                          id: `c-${menuId}`,
                          title: `${getMenuNameById(menuId)} (追加)`,
                          type: "added",
                          originalId: menuId,
                          isChange: true,
                          isAdded: isAdded,
                        });
                        displayedIds.add(menuId);
                      }
                    }
                  );

                  // 🚀 全体をソートしてから列ごとに分割（カレンダーと同じソート順）
                  const sortedAllMenuItems = allMenuItems.sort((a, b) =>
                    a.title.localeCompare(b.title, "ja", { sensitivity: "base" })
                  );

                  // 各列のアイテムを計算
                  const startIndex = columnIndex * 8;
                  const endIndex = (columnIndex + 1) * 8;
                  const columnItems = sortedAllMenuItems.slice(startIndex, endIndex);

                  return (
                    <div
                      key={columnIndex}
                      className="w-[33.333%] flex flex-col"
                    >
                      <MenuItemList
                        items={columnItems}
                        onDeleteMenu={handleRemoveMenu}
                        onDeleteOriginalMenu={handleRemoveOriginalMenu}
                        onRevertChange={handleRevertChange}
                        variant="monthMenu"
                        maxItems={
                          endIndex <= 23 ? 8 : Math.max(0, 23 - startIndex)
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {menus.length === 0 &&
                originalMenus.length === 0 &&
                Object.keys(monthlyChangeData.commonMenuIds).length === 0 &&
                Object.keys(monthlyChangeData.originalMenuIds).length === 0 && (
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
  }
);

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
