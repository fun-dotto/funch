import { useState, useEffect } from "react";
import { MenuService } from "../services/MenuService";
import { Menu, OriginalMenu } from "../types/Menu";

export const useMenuListPresenter = (menuService: MenuService) => {
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allMenusData, originalMenusData] = await Promise.all([
          menuService.getAllMenus(),
          menuService.getOriginalMenus(),
        ]);

        setAllMenus(allMenusData);
        setOriginalMenus(originalMenusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "メニューデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [menuService]);

  const getCategoryMenus = (categoryCode: number): Menu[] => {
    return menuService.getCategoryMenus(allMenus, categoryCode);
  };

  return {
    allMenus,
    originalMenus,
    loading,
    error,
    getCategoryMenus,
  };
};