import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu, MenuItem } from "../types/Menu";
import { MonthMenuService } from "../services/MonthMenuService";
import { ChangeMenuService } from "../services/ChangeMenuService";

export const useMonthMenuPresenter = (
  user: User | null,
  currentYear: number,
  currentMonth: number,
  monthMenuService: MonthMenuService
) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [monthlyChangeData, setMonthlyChangeData] = useState<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }>({ commonMenuIds: {}, originalMenuIds: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changeMenuService = new ChangeMenuService();

  useEffect(() => {
    const fetchMonthMenuData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const { menus: newMenus, originalMenus: newOriginalMenus } =
          await monthMenuService.getMonthMenuData(currentYear, currentMonth);

        const sortedMenus = monthMenuService.sortMenus(newMenus);
        setMenus(sortedMenus);
        setOriginalMenus(newOriginalMenus);

        // 月次変更データを取得
        const monthlyChange = await changeMenuService.getMonthlyChangeData(currentYear, currentMonth);
        setMonthlyChangeData(monthlyChange);
      } catch (error) {
        console.error("月間メニューデータの取得に失敗しました:", error);
        setError("月間メニューデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthMenuData();
  }, [user, currentYear, currentMonth, monthMenuService]);

  const saveMonthMenuData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await monthMenuService.saveMonthMenuData(
        currentYear,
        currentMonth,
        menus,
        originalMenus
      );
    } catch (error) {
      console.error("月間メニューデータの保存に失敗しました:", error);
      setError("月間メニューデータの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const addMenu = (menu: Menu) => {
    setMenus((prev) => {
      const exists = prev.find((m) => m.item_code === menu.item_code);
      if (exists) return prev;

      const newMenus = [...prev, menu];
      return monthMenuService.sortMenus(newMenus);
    });
  };

  const addOriginalMenu = (originalMenu: OriginalMenu) => {
    setOriginalMenus((prev) => {
      const exists = prev.find((m) => m.id === originalMenu.id);
      if (exists) return prev;

      return [...prev, originalMenu];
    });
  };

  const removeMenu = async (menuItemCode: number) => {
    // 削除フラグをfunch_monthly_changeに記録（Firestoreからは削除しない）
    try {
      const menuItem: MenuItem = {
        id: menuItemCode,
        name: "",
        category_id: 0,
        prices: { medium: 0 }
      };
      await changeMenuService.saveMonthlyDeletion(
        currentYear,
        currentMonth,
        menuItem
      );
      
      // 削除フラグの記録のみで画面状態は変更しない
      // （実際のFirestoreからは削除されていないため）
    } catch (error) {
      console.error("メニューの削除保存に失敗しました:", error);
      setError("メニューの削除保存に失敗しました");
    }
  };

  const removeOriginalMenu = async (originalMenuId: string) => {
    // 削除フラグをfunch_monthly_changeに記録（Firestoreからは削除しない）
    try {
      const menuItem: MenuItem = {
        id: originalMenuId,
        name: "",
        category_id: 0,
        prices: { medium: 0 }
      };
      await changeMenuService.saveMonthlyDeletion(
        currentYear,
        currentMonth,
        menuItem
      );
      
      // 削除フラグの記録のみで画面状態は変更しない
      // （実際のFirestoreからは削除されていないため）
    } catch (error) {
      console.error("オリジナルメニューの削除保存に失敗しました:", error);
      setError("オリジナルメニューの削除保存に失敗しました");
    }
  };

  const refreshData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { menus: newMenus, originalMenus: newOriginalMenus } =
        await monthMenuService.getMonthMenuData(currentYear, currentMonth);

      const sortedMenus = monthMenuService.sortMenus(newMenus);
      setMenus(sortedMenus);
      setOriginalMenus(newOriginalMenus);

      // 月次変更データを取得
      const monthlyChange = await changeMenuService.getMonthlyChangeData(currentYear, currentMonth);
      setMonthlyChangeData(monthlyChange);
    } catch (error) {
      console.error("月間メニューデータの取得に失敗しました:", error);
      setError("月間メニューデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
