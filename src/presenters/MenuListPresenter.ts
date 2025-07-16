import { useState, useEffect } from "react";
import { MenuItem } from "../types/Menu";

export const useMenuListPresenter = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [originalMenuItems, setOriginalMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menuResponse, originalMenuResponse] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/original_menu"),
        ]);

        if (!menuResponse.ok || !originalMenuResponse.ok) {
          throw new Error("API呼び出しに失敗しました");
        }

        const menuData = await menuResponse.json();
        const originalMenuData = await originalMenuResponse.json();

        // APIからのMenuItem形式をそのまま使用
        setMenuItems(menuData.data.menus);
        setOriginalMenuItems(originalMenuData.data.menus);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "メニューデータの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const getCategoryMenus = (categoryCode: number): MenuItem[] => {
    return menuItems.filter((menu) => menu.category_id === categoryCode);
  };

  return {
    menuItems,
    originalMenuItems,
    loading,
    error,
    getCategoryMenus,
  };
};
