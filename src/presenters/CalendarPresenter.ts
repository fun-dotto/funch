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

      // ローカルのstateを更新
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      setMenuData((prev) => {
        const newMenuData = new Map(prev);
        const currentMenus = newMenuData.get(dateId) || [];
        const updatedMenus = currentMenus.filter(
          (menu) => menu.item_code !== menuItemCode
        );
        newMenuData.set(dateId, updatedMenus);
        return newMenuData;
      });
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

      // ローカルのstateを更新
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      setOriginalMenuData((prev) => {
        const newOriginalMenuData = new Map(prev);
        const currentMenus = newOriginalMenuData.get(dateId) || [];
        const updatedMenus = currentMenus.filter(
          (menu) => menu.id !== originalMenuId
        );
        newOriginalMenuData.set(dateId, updatedMenus);
        return newOriginalMenuData;
      });
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
