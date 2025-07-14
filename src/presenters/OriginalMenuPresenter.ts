import { useState, useEffect } from "react";
import { OriginalMenu } from "../types/Menu";
import { MenuService } from "../services/MenuService";
import { FirebaseMenuRepository } from "../repositories/firebase/MenuRepository";

export const useOriginalMenuPresenter = () => {
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOriginalMenus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Firestore直接操作でデータを取得
      const menuRepository = new FirebaseMenuRepository();
      const menuService = new MenuService(menuRepository);
      
      const originalMenus = await menuService.getOriginalMenus();
      
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
