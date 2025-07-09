import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu } from "../repository/menu";
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

  return {
    menuData,
    originalMenuData,
    loading,
  };
};
