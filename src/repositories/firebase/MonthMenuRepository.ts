import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { database } from "../../infrastructure/firebase";
import { Menu, OriginalMenu } from "../../types/Menu";
import { MonthMenuRepository } from "../interfaces/MonthMenuRepository";

export class FirebaseMonthMenuRepository implements MonthMenuRepository {
  private formatDateJST(date: Date, monthOnly: boolean): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    };
    const formatter = new Intl.DateTimeFormat("ja-JP", options);
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return monthOnly ? `${year}${month}` : `${year}${month}${day}`;
  }

  private async getAllMenus(): Promise<Menu[]> {
    // 直接Firebase Storageからmenu.jsonを取得
    const { getBytes, ref } = await import("firebase/storage");
    const { storage } = await import("../../infrastructure/firebase");

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
      return new Menu(
        data.item_code,
        data.title,
        data.price.medium,
        data.image,
        data.category,
        data.large,
        data.small,
        data.energy
      );
    });
  }

  private async getOriginalMenuList(): Promise<OriginalMenu[]> {
    const originalMenuList: OriginalMenu[] = [];

    const docOriginalMenuRef = query(
      collection(database, "funch_original_menu")
    );
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);

    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.name; // name フィールドから取得
      const category = data.category_id; // category_id フィールドから取得

      // 価格構造を新しい形式で取得
      let price = {
        medium: 0,
        small: undefined as number | undefined,
        large: undefined as number | undefined,
      };

      if (
        data.prices &&
        typeof data.prices === "object" &&
        !Array.isArray(data.prices)
      ) {
        // prices フィールドから取得
        price = {
          medium: data.prices.medium || 0,
          small: data.prices.small || undefined,
          large: data.prices.large || undefined,
        };
      }

      originalMenuList.push({
        id: id,
        title: title,
        price: price,
        category: category,
      });
    });

    return originalMenuList;
  }

  async getMonthMenuData(
    year: number,
    month: number
  ): Promise<{
    menus: Menu[];
    originalMenus: OriginalMenu[];
  }> {
    const allMenus = await this.getAllMenus();
    const originalMenuList = await this.getOriginalMenuList();

    // 月の1日0時0分のTimestampを作成
    const firstDayOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const docId = this.formatDateJST(firstDayOfMonth, false).substring(0, 6); // YYYYMM

    const docMonthRef = doc(database, "funch_monthly_menu", docId);
    const docMonthSnap = await getDoc(docMonthRef);

    if (docMonthSnap.exists()) {
      const data = docMonthSnap.data();

      const menuCodes =
        data.common_menu_ids != undefined
          ? (data.common_menu_ids as number[])
          : [];
      const menus = menuCodes
        .map((m: number) => {
          return allMenus.find((menu) => menu.item_code == m);
        })
        .filter((m) => m != undefined) as Menu[];

      const originalMenuIds =
        data.original_menu_ids != undefined
          ? (data.original_menu_ids as string[])
          : [];
      const originalMenus = originalMenuIds
        .map((id) => {
          return originalMenuList.find((m) => m.id == id);
        })
        .filter((m) => m != undefined) as OriginalMenu[];

      return { menus, originalMenus };
    } else {
      const defaultMenuCodes = [
        10002, 12057, 12075, 17364, 17366, 17390, 17392, 7051, 7053, 7052, 8001,
      ];
      const menus = defaultMenuCodes
        .map((m: number) => {
          return allMenus.find((menu) => menu.item_code == m);
        })
        .filter((m) => m != undefined) as Menu[];

      return { menus, originalMenus: [] };
    }
  }

  async saveMonthMenuData(
    year: number,
    month: number,
    menus: Menu[],
    originalMenus: OriginalMenu[]
  ): Promise<void> {
    const firstDayOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const menuItemCodes = menus.map((m) => m.item_code);
    const originalMenuIds = originalMenus.map((m) => m.id);

    const docId = this.formatDateJST(firstDayOfMonth, false).substring(0, 6); // YYYYMM
    await setDoc(doc(database, "funch_monthly_menu", docId), {
      date: Timestamp.fromDate(firstDayOfMonth),
      common_menu_ids: menuItemCodes,
      original_menu_ids: originalMenuIds,
    });
  }
}
