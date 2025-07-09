import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu } from "../repository/menu";
import { MonthMenuService } from "../services/MonthMenuService";

export const useMonthMenuPresenter = (
  user: User | null,
  currentYear: number,
  currentMonth: number,
  monthMenuService: MonthMenuService
) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setMenus(prev => {
      const exists = prev.find(m => m.item_code === menu.item_code);
      if (exists) return prev;
      
      const newMenus = [...prev, menu];
      return monthMenuService.sortMenus(newMenus);
    });
  };

  const addOriginalMenu = (originalMenu: OriginalMenu) => {
    setOriginalMenus(prev => {
      const exists = prev.find(m => m.id === originalMenu.id);
      if (exists) return prev;
      
      return [...prev, originalMenu];
    });
  };

  const removeMenu = async (menuItemCode: number) => {
    setMenus(prev => prev.filter(menu => menu.item_code !== menuItemCode));
    
    // Firebase に保存
    try {
      const updatedMenus = menus.filter(menu => menu.item_code !== menuItemCode);
      await monthMenuService.saveMonthMenuData(
        currentYear,
        currentMonth,
        updatedMenus,
        originalMenus
      );
    } catch (error) {
      console.error("メニューの削除保存に失敗しました:", error);
      setError("メニューの削除保存に失敗しました");
    }
  };

  const removeOriginalMenu = async (originalMenuId: string) => {
    setOriginalMenus(prev => prev.filter(menu => menu.id !== originalMenuId));
    
    // Firebase に保存
    try {
      const updatedOriginalMenus = originalMenus.filter(menu => menu.id !== originalMenuId);
      await monthMenuService.saveMonthMenuData(
        currentYear,
        currentMonth,
        menus,
        updatedOriginalMenus
      );
    } catch (error) {
      console.error("オリジナルメニューの削除保存に失敗しました:", error);
      setError("オリジナルメニューの削除保存に失敗しました");
    }
  };

  return {
    menus,
    originalMenus,
    loading,
    error,
    addMenu,
    addOriginalMenu,
    removeMenu,
    removeOriginalMenu,
    saveMonthMenuData,
  };
};