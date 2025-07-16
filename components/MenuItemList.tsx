import React from "react";
import { HiTrash } from "react-icons/hi";

export interface DisplayMenuItem {
  id: string;
  title: string;
  type: "deleted" | "normal" | "added";
  itemCode?: number;
  originalId?: string;
  isChange?: boolean; // MonthMenuで使用
  isAdded?: boolean; // MonthMenuで使用
}

interface MenuItemListProps {
  items: DisplayMenuItem[];
  onDeleteMenu?: (menuItemCode: number) => void;
  onDeleteOriginalMenu?: (originalMenuId: string) => void;
  onRevertChange?: (menuId: string, isCommonMenu: boolean) => void;
  variant?: "monthMenu" | "calendar";
  maxItems?: number;
  className?: string;
}

export const MenuItemList: React.FC<MenuItemListProps> = ({
  items,
  onDeleteMenu,
  onDeleteOriginalMenu,
  onRevertChange,
  variant = "calendar",
  maxItems,
  className = "",
}) => {
  // 五十音順でソート
  const sortedMenuItems = items.sort((a, b) =>
    a.title.localeCompare(b.title, "ja", { sensitivity: "base" })
  );

  // 表示制限の適用
  const displayItems = maxItems
    ? sortedMenuItems.slice(0, maxItems)
    : sortedMenuItems;
  const remainingCount = maxItems
    ? Math.max(0, sortedMenuItems.length - maxItems)
    : 0;

  // 状態別スタイル取得
  const getClassName = (item: DisplayMenuItem): string => {
    const baseClass = "flex justify-between items-center relative";
    const textSize = variant === "monthMenu" ? "text-[10px]" : "text-xs";

    let stateClass = "";

    if (variant === "monthMenu") {
      if (item.isChange) {
        stateClass =
          item.isAdded === false
            ? "bg-red-100" // 削除
            : "bg-green-100"; // 追加
      }
    } else {
      // calendar variant
      switch (item.type) {
        case "deleted":
          stateClass = "bg-red-100";
          break;
        case "added":
          stateClass = "bg-green-100";
          break;
        default:
          stateClass = "";
      }
    }

    return `${baseClass} ${textSize} ${stateClass}`;
  };

  // クリックハンドラー取得
  const getClickHandler = (item: DisplayMenuItem): (() => void) | undefined => {
    if (variant === "monthMenu") {
      // MonthMenuの場合
      if (!item.isChange) {
        if (item.itemCode) {
          return () => onDeleteMenu?.(item.itemCode!);
        } else if (item.originalId) {
          return () => onDeleteOriginalMenu?.(item.originalId!);
        }
      }
    } else {
      // Calendarの場合
      if (item.type === "normal") {
        if (item.itemCode) {
          return () => onDeleteMenu?.(item.itemCode!);
        } else if (item.originalId) {
          return () => onDeleteOriginalMenu?.(item.originalId!);
        }
      } else if (item.type === "deleted" || item.type === "added") {
        const menuId = item.itemCode
          ? item.itemCode.toString()
          : item.originalId!;
        const isCommonMenu = !!item.itemCode;
        return () => onRevertChange?.(menuId, isCommonMenu);
      }
    }
    return undefined;
  };

  // 表示タイトル取得
  const getDisplayTitle = (item: DisplayMenuItem): string => {
    if (variant === "calendar" && item.type === "added") {
      return typeof item.itemCode === "number"
        ? item.title
        : `FUN ${item.title}`;
    }
    return item.title;
  };

  return (
    <div className={className}>
      {displayItems.map((item) => (
        <div key={item.id} className={getClassName(item)}>
          <div className="flex-1 truncate pr-6">{getDisplayTitle(item)}</div>
          <div
            className={`text-black cursor-pointer hover:text-red-600 ${
              variant === "monthMenu" ? "pr-12" : "absolute right-2"
            }`}
            onClick={getClickHandler(item)}
          >
            <HiTrash />
          </div>
        </div>
      ))}

      {/* 残り件数表示（MonthMenuのみ） */}
      {variant === "monthMenu" && remainingCount > 0 && (
        <div className="flex justify-between items-center text-[10px] relative text-gray-500">
          <div className="flex-1 truncate pr-6">他{remainingCount}件</div>
          <div className="pr-12"></div>
        </div>
      )}
    </div>
  );
};
