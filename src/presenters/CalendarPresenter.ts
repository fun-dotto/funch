import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu } from "../types/Menu";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuService } from "../services/CalendarService";
import { MenuService } from "../services/MenuService";
import { FirebaseMenuRepository } from "../repositories/firebase/MenuRepository";

const menuRepository = new FirebaseMenuRepository();
const menuService = new MenuService(menuRepository);

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
  const [changeData, setChangeData] = useState(
    new Map<
      UniqueIdentifier,
      {
        commonMenuIds: Record<string, boolean>;
        originalMenuIds: Record<string, boolean>;
      }
    >()
  );
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [allOriginalMenus, setAllOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // メニューデータを並行して取得
        const [menuResult, allMenusResult, allOriginalMenusResult] = await Promise.all([
          calendarMenuService.getMonthMenuData(currentYear, currentMonth),
          menuService.getAllMenus(),
          menuService.getOriginalMenus()
        ]);

        setMenuData(menuResult.menuData);
        setOriginalMenuData(menuResult.originalMenuData);
        setChangeData(menuResult.changeData);
        setAllMenus(allMenusResult);
        setAllOriginalMenus(allOriginalMenusResult);
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

  const refreshData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // メニューデータを並行して取得
      const [menuResult, allMenusResult, allOriginalMenusResult] = await Promise.all([
        calendarMenuService.getMonthMenuData(currentYear, currentMonth),
        menuService.getAllMenus(),
        menuService.getOriginalMenus()
      ]);

      setMenuData(menuResult.menuData);
      setOriginalMenuData(menuResult.originalMenuData);
      setChangeData(menuResult.changeData);
      setAllMenus(allMenusResult);
      setAllOriginalMenus(allOriginalMenusResult);
    } catch (error) {
      console.error("メニューデータの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 最適化: 特定日の変更データのみを更新
  const refreshSingleDayChange = async (date: Date) => {
    if (!user) return;

    setLoading(true); // ローディング開始
    try {
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);
      
      // 特定日の変更データのみ取得
      const dailyChangeData = await calendarMenuService.getSingleDayChangeData(date);
      
      // 該当日のみ更新
      setChangeData(prev => {
        const newChangeData = new Map(prev);
        newChangeData.set(dateId, dailyChangeData);
        return newChangeData;
      });
    } catch (error) {
      console.error("変更データの更新に失敗しました:", error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  // メニューIDからメニュー名を取得する関数
  const getMenuNameById = (menuId: string): string => {
    // 数値IDの場合は共通メニューから検索
    const numericId = parseInt(menuId, 10);
    if (!isNaN(numericId)) {
      const menu = allMenus.find(m => m.item_code === numericId);
      return menu ? menu.title : `メニュー(ID: ${menuId})`;
    }
    
    // 文字列IDの場合はオリジナルメニューから検索
    const originalMenu = allOriginalMenus.find(m => m.id === menuId);
    return originalMenu ? originalMenu.title : `メニュー(ID: ${menuId})`;
  };

  return {
    menuData,
    originalMenuData,
    changeData,
    loading,
    deleteDailyMenu,
    deleteDailyOriginalMenu,
    refreshData,
    refreshSingleDayChange, // 🚀 新機能
    getMenuNameById,
  };
};
