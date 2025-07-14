import { useState, useEffect } from "react";
import { OriginalMenu, MenuItem } from "../types/Menu";

export const useOriginalMenuPresenter = () => {
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOriginalMenus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/original_menu");

      if (!response.ok) {
        throw new Error("API呼び出しに失敗しました");
      }

      const data = await response.json();

      // APIからのMenuItem形式をOriginalMenu形式に変換
      const originalMenus: OriginalMenu[] = data.data.menus.map(
        (item: MenuItem) => ({
          id: String(item.id),
          title: item.name,
          category: item.category_id,
          price: item.prices,
        })
      );

      // カテゴリで並び替え
      const sortedMenus = originalMenus.sort((a, b) => a.category - b.category);
      setOriginalMenus(sortedMenus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "オリジナルメニューデータの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOriginalMenus();
  }, []);

  const getMenusByCategory = (category: number): OriginalMenu[] => {
    return originalMenus.filter((menu) => menu.category === category);
  };

  const getAllMenus = (): OriginalMenu[] => {
    return originalMenus;
  };

  const refresh = () => {
    fetchOriginalMenus();
  };

  return {
    originalMenus,
    loading,
    error,
    getMenusByCategory,
    getAllMenus,
    refresh,
  };
};
