import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import {
  Menu,
  OriginalMenu,
  MenuItem,
  getCategoryMenu,
  convertOriginalMenuToMenuItem,
} from "../types/Menu";
import { getBytes, ref } from "firebase/storage";
import { storage } from "../infrastructure/firebase";
import { OriginalMenuCRUDService } from "./OriginalMenuCRUDService";

type MenuResponse = {
  menus: MenuItem[];
};

export class MenuService {
  private originalMenuCRUDService: OriginalMenuCRUDService;

  constructor(private menuRepository: MenuRepository) {
    this.originalMenuCRUDService = new OriginalMenuCRUDService();
  }

  async getAllMenus(): Promise<Menu[]> {
    return await this.menuRepository.getAllMenus();
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    return await this.menuRepository.getOriginalMenus();
  }

  getCategoryMenus(allMenus: Menu[], categoryCode: number): Menu[] {
    return getCategoryMenu(allMenus, categoryCode);
  }

  async getRawMenuWithPrices(): Promise<MenuItem[]> {
    const pathReference = ref(storage, "funch/menu.json");
    const bytes = await getBytes(pathReference);
    const jsonString = new TextDecoder().decode(bytes);
    const jsonData: {
      item_code: number;
      title: string;
      price: { large?: number; medium: number; small?: number };
      image: string;
      category: number;
      large: boolean;
      small: boolean;
      energy: number;
    }[] = JSON.parse(jsonString);

    return jsonData.map((data) => {
      const prices: { small?: number; medium: number; large?: number } = {
        medium: data.price.medium,
      };

      if (data.price.small) {
        prices.small = data.price.small;
      }
      if (data.price.large) {
        prices.large = data.price.large;
      }

      return {
        name: data.title,
        category_id: data.category,
        prices,
        id: data.item_code,
      };
    });
  }

  async getFormattedMenus(): Promise<MenuResponse> {
    const rawMenus = await this.getRawMenuWithPrices();

    return {
      menus: rawMenus.sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  async getFormattedOriginalMenus(): Promise<MenuResponse> {
    const originalMenus = await this.getOriginalMenus();

    return {
      menus: originalMenus
        .map((originalMenu) => convertOriginalMenuToMenuItem(originalMenu))
        .sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  async createOriginalMenu(
    menuData: Omit<OriginalMenu, "id">
  ): Promise<OriginalMenu> {
    const newMenu: OriginalMenu = {
      ...menuData,
      id: "0", // OriginalMenuCRUDServiceが新規作成として認識
    };
    return await this.originalMenuCRUDService.saveOriginalMenu(newMenu);
  }

  async updateOriginalMenu(
    id: string,
    menuData: Omit<OriginalMenu, "id">
  ): Promise<OriginalMenu> {
    const updatedMenu: OriginalMenu = {
      ...menuData,
      id,
    };
    return await this.originalMenuCRUDService.saveOriginalMenu(updatedMenu);
  }

  async deleteOriginalMenu(id: string): Promise<void> {
    return await this.originalMenuCRUDService.deleteOriginalMenu(id);
  }

  async getMenuById(id: number): Promise<MenuItem | null> {
    const rawMenus = await this.getRawMenuWithPrices();
    return rawMenus.find(menu => menu.id === id) || null;
  }

  async getOriginalMenuById(id: string): Promise<MenuItem | null> {
    const originalMenus = await this.getOriginalMenus();
    const originalMenu = originalMenus.find(menu => menu.id === id);
    return originalMenu ? convertOriginalMenuToMenuItem(originalMenu) : null;
  }

  async getAllDailyMenuDates(): Promise<string[]> {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    const docRef = query(
      collection(database, "funch_daily_menu"),
      orderBy("date", "asc")
    );
    const docSnap = await getDocs(docRef);

    const dates: string[] = [];
    docSnap.forEach((doc) => {
      dates.push(doc.id); // ドキュメントIDが日付（例: 20250709）
    });

    return dates;
  }

  async getDailyMenuByDate(date: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    const { doc, getDoc } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    const docRef = doc(database, "funch_daily_menu", date);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      common_menu_ids: data.common_menu_ids || [],
      original_menu_ids: data.original_menu_ids || [],
    };
  }

  async getDailyMenuItemsByDate(date: string): Promise<MenuItem[] | null> {
    const dailyMenu = await this.getDailyMenuByDate(date);
    if (!dailyMenu) {
      return null;
    }

    const menuItems: MenuItem[] = [];

    // 通常メニューを取得
    for (const menuId of dailyMenu.common_menu_ids) {
      const menuItem = await this.getMenuById(menuId);
      if (menuItem) {
        menuItems.push(menuItem);
      }
    }

    // オリジナルメニューを取得
    for (const originalMenuId of dailyMenu.original_menu_ids) {
      const originalMenuItem = await this.getOriginalMenuById(originalMenuId);
      if (originalMenuItem) {
        menuItems.push(originalMenuItem);
      }
    }

    return menuItems;
  }

  async getAllMonthlyMenuMonths(): Promise<string[]> {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    const docRef = query(
      collection(database, "funch_monthly_menu"),
      orderBy("date", "asc")
    );
    const docSnap = await getDocs(docRef);

    const months: string[] = [];
    docSnap.forEach((doc) => {
      const docId = doc.id; // YYYYMM形式（例: 202507）
      // YYYY-MM形式に変換
      const year = docId.substring(0, 4);
      const month = docId.substring(4, 6);
      months.push(`${year}-${month}`);
    });

    return months;
  }

  async getMonthlyMenuByMonth(month: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    const { doc, getDoc } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    // YYYY-MM から YYYYMM に変換
    const formattedMonth = month.replace(/-/g, "");

    const docRef = doc(database, "funch_monthly_menu", formattedMonth);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      common_menu_ids: data.common_menu_ids || [],
      original_menu_ids: data.original_menu_ids || [],
    };
  }

  async getMonthlyMenuItemsByMonth(month: string): Promise<MenuItem[] | null> {
    const monthlyMenu = await this.getMonthlyMenuByMonth(month);
    if (!monthlyMenu) {
      return null;
    }

    const menuItems: MenuItem[] = [];

    // 通常メニューを取得
    for (const menuId of monthlyMenu.common_menu_ids) {
      const menuItem = await this.getMenuById(menuId);
      if (menuItem) {
        menuItems.push(menuItem);
      }
    }

    // オリジナルメニューを取得
    for (const originalMenuId of monthlyMenu.original_menu_ids) {
      const originalMenuItem = await this.getOriginalMenuById(originalMenuId);
      if (originalMenuItem) {
        menuItems.push(originalMenuItem);
      }
    }

    return menuItems;
  }
}
