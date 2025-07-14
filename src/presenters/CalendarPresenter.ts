import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu } from "../types/Menu";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuService } from "../services/CalendarService";

export const useCalendarMenuPresenter = (
  user: User | null,
  currentYear: number,
  currentMonth: number,
  calendarMenuService: CalendarMenuService
) => {
  const [menuData, setMenuData] = useState(new Map<UniqueIdentifier, Menu[]>());
  const [originalMenuData, setOriginalMenuData] = useState(
    new Map<UniqueIdentifier, OriginalMenu[]>()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { menuData: newMenuData, originalMenuData: newOriginalMenuData } =
          await calendarMenuService.getMonthMenuData(currentYear, currentMonth);

        setMenuData(newMenuData);
        setOriginalMenuData(newOriginalMenuData);
      } catch (error) {
        console.error("メニューデータの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [user, currentYear, currentMonth, calendarMenuService]);

  const deleteDailyMenu = async (date: Date, menuItemCode: number) => {
    if (!user) return;

    setLoading(true);
    try {
      await calendarMenuService.deleteDailyMenu(date, menuItemCode);
      
      // 削除フラグの記録のみで画面状態は変更しない
      // （実際のFirestoreからは削除されていないため）
    } catch (error) {
      console.error("メニューの削除に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDailyOriginalMenu = async (
    date: Date,
    originalMenuId: string
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      await calendarMenuService.deleteDailyOriginalMenu(date, originalMenuId);

      // 削除フラグの記録のみで画面状態は変更しない
      // （実際のFirestoreからは削除されていないため）
    } catch (error) {
      console.error("オリジナルメニューの削除に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    menuData,
    originalMenuData,
    loading,
    deleteDailyMenu,
    deleteDailyOriginalMenu,
  };
};
