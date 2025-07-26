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
        // メニューデータを並行して取得（APIから最新データを取得）
        const [menuResult, menuResponse, originalMenuResponse] =
          await Promise.all([
            calendarMenuService.getMonthMenuData(currentYear, currentMonth),
            fetch("/api/menu"),
            fetch("/api/original_menu"),
          ]);

        if (!menuResponse.ok || !originalMenuResponse.ok) {
          throw new Error("API呼び出しに失敗しました");
        }

        const menuData = await menuResponse.json();
        const originalMenuData = await originalMenuResponse.json();

        setMenuData(menuResult.menuData);
        setOriginalMenuData(menuResult.originalMenuData);
        setChangeData(menuResult.changeData);
        setAllMenus(menuData.data.menus.map((item: any) => ({
          id: item.id,
          item_code: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          category: item.category_id,
          large: item.large,
          small: item.small,
          energy: item.energy,
        })));
        setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
          id: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          category: item.category_id,
          energy: item.energy,
        })));
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

      // 🚀 削除後に該当日の変更データを即時更新（ローディング状態は維持）
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      const dailyChangeData = await calendarMenuService.getSingleDayChangeData(date);

      setChangeData((prev) => {
        const newChangeData = new Map(prev);
        newChangeData.set(dateId, dailyChangeData);
        return newChangeData;
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

      // 🚀 削除後に該当日の変更データを即時更新（ローディング状態は維持）
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      const dailyChangeData = await calendarMenuService.getSingleDayChangeData(date);

      setChangeData((prev) => {
        const newChangeData = new Map(prev);
        newChangeData.set(dateId, dailyChangeData);
        return newChangeData;
      });
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
      // メニューデータを並行して取得（APIから最新データを取得）
      const [menuResult, menuResponse, originalMenuResponse] =
        await Promise.all([
          calendarMenuService.getMonthMenuData(currentYear, currentMonth),
          fetch("/api/menu"),
          fetch("/api/original_menu"),
        ]);

      if (!menuResponse.ok || !originalMenuResponse.ok) {
        throw new Error("API呼び出しに失敗しました");
      }

      const menuData = await menuResponse.json();
      const originalMenuData = await originalMenuResponse.json();

      setMenuData(menuResult.menuData);
      setOriginalMenuData(menuResult.originalMenuData);
      setChangeData(menuResult.changeData);
      setAllMenus(menuData.data.menus.map((item: any) => ({
        id: item.id,
        item_code: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        large: item.large,
        small: item.small,
        energy: item.energy,
      })));
      setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        energy: item.energy,
      })));
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
      const dailyChangeData = await calendarMenuService.getSingleDayChangeData(
        date
      );

      // 該当日のみ更新
      setChangeData((prev) => {
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

  // 🚀 メニューデータのみ再取得（オリジナルメニュー追加時に使用）
  const refreshAllMenusData = async () => {
    if (!user) return;

    try {
      const [menuResponse, originalMenuResponse] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/original_menu"),
      ]);

      if (!menuResponse.ok || !originalMenuResponse.ok) {
        throw new Error("API呼び出しに失敗しました");
      }

      const menuData = await menuResponse.json();
      const originalMenuData = await originalMenuResponse.json();

      setAllMenus(menuData.data.menus.map((item: any) => ({
        id: item.id,
        item_code: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        large: item.large,
        small: item.small,
        energy: item.energy,
      })));
      setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        energy: item.energy,
      })));
    } catch (error) {
      console.error("メニューデータの更新に失敗しました:", error);
    }
  };

  // 🚀 change要素のリバート処理（変更を取り消し）
  const revertChange = async (date: Date, menuId: string, isCommonMenu: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      // 該当の変更データを削除してリバート
      await calendarMenuService.revertDailyChange(date, menuId, isCommonMenu);

      // リバート後に該当日の変更データを即座に更新
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      const dailyChangeData = await calendarMenuService.getSingleDayChangeData(date);

      setChangeData((prev) => {
        const newChangeData = new Map(prev);
        newChangeData.set(dateId, dailyChangeData);
        return newChangeData;
      });
    } catch (error) {
      console.error("変更のリバートに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  // メニューIDからメニュー名を取得する関数
  const getMenuNameById = (menuId: string): string => {
    // 数値IDの場合は共通メニューから検索
    const numericId = parseInt(menuId, 10);
    if (!isNaN(numericId)) {
      const menu = allMenus.find((m) => m.item_code === numericId);
      return menu ? menu.title : `メニュー(ID: ${menuId})`;
    }

    // 文字列IDの場合はオリジナルメニューから検索
    const originalMenu = allOriginalMenus.find((m) => m.id === menuId);
    return originalMenu ? originalMenu.title : `メニュー(ID: ${menuId})`;
  };

  // 🚀 メニューの確定処理 - 月に関係なくすべてのデータに対して実行
  const confirmMenuChanges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 全ての変更データを確定処理
      await calendarMenuService.confirmAllChanges();
      
      // 確定後にデータを再取得
      await refreshData();
    } catch (error) {
      console.error("メニューの確定処理に失敗しました:", error);
    } finally {
      setLoading(false);
    }
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
    refreshAllMenusData, // 🚀 メニューデータ再取得
    revertChange, // 🚀 リバート機能
    getMenuNameById,
    confirmMenuChanges, // 🚀 確定処理
  };
};
