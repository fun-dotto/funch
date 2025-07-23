import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";

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

  // 外側コンテナのスタイル取得
  const getContainerClassName = (): string => {
    const textSize = variant === "monthMenu" ? "text-[10px]" : "text-xs";
    return `${textSize}`;
  };

  // 内側コンテンツのスタイル取得
  const getContentClassName = (item: DisplayMenuItem): string => {
    const baseClass = "flex justify-between items-center w-full";

    let stateClass = "";

    // 統一されたスタイル
    if (
      (variant === "monthMenu" && item.isChange) ||
      (variant === "calendar" && item.type !== "normal")
    ) {
      const isDeleted =
        variant === "monthMenu"
          ? item.isAdded === false
          : item.type === "deleted";
      stateClass = isDeleted
        ? "bg-[#FFE2E2] text-[#B91212]"
        : "bg-[#CDEFCF] text-[#006504]";
    }

    return `${baseClass} ${stateClass}`;
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
      } else {
        // 変更アイテム（追加・削除）の場合
        const menuId = item.itemCode?.toString() || item.originalId!;
        const isCommonMenu = !!item.itemCode;
        return () => onRevertChange?.(menuId, isCommonMenu);
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

  // ボタンアイコン取得
  const getButtonIcon = (item: DisplayMenuItem) => {
    const isDeleted =
      variant === "monthMenu"
        ? item.isAdded === false
        : item.type === "deleted";

    if (isDeleted) {
      return <FaPlus />;
    } else {
      return <FaMinus />;
    }
  };

  return (
    <div className={className}>
      {displayItems.map((item) => (
        <div key={item.id} className={`${getContainerClassName()} pr-16`}>
          <div className={getContentClassName(item)}>
            <div
              className={`flex items-center truncate ${
                variant === "monthMenu" ? "w-[80%]" : ""
              }`}
            >
              <span className="truncate">{getDisplayTitle(item)}</span>
            </div>
            <div
              className={`text-black cursor-pointer ${
                variant === "monthMenu"
                  ? item.isAdded === false
                    ? "hover:text-[#006504]" // 削除状態（プラスアイコン）は追加時の色
                    : "hover:text-[#F51F1F]" // ノーマル・追加状態（マイナスアイコン）は削除時の色
                  : item.type === "deleted"
                  ? "hover:text-[#006504]" // 削除状態（プラスアイコン）は追加時の色
                  : "hover:text-[#F51F1F]" // ノーマル・追加状態（マイナスアイコン）は削除時の色
              }`}
              onClick={getClickHandler(item)}
            >
              {getButtonIcon(item)}
            </div>
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
