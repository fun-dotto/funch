import { useState, useEffect } from "react";
import { OriginalMenuService } from "../services/OriginalMenuService";
import { OriginalMenu } from "../types/Menu";

export const useOriginalMenuPresenter = (originalMenuService: OriginalMenuService) => {
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOriginalMenus = async () => {
      try {
        setLoading(true);
        setError(null);

        const originalMenusData = await originalMenuService.getOriginalMenus();
        const sortedMenus = originalMenuService.sortByCategory(originalMenusData);
        setOriginalMenus(sortedMenus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "オリジナルメニューデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalMenus();
  }, [originalMenuService]);

  const getMenusByCategory = (category: number): OriginalMenu[] => {
    return originalMenuService.filterByCategory(originalMenus, category);
  };

  const getAllMenus = (): OriginalMenu[] => {
    return originalMenus;
  };

  return {
    originalMenus,
    loading,
    error,
    getMenusByCategory,
    getAllMenus,
  };
};