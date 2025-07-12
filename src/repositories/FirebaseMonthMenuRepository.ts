import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  DocumentReference,
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { Menu, OriginalMenu, importMenu } from "../repository/menu";
import { MonthMenuRepository } from "./interfaces/MonthMenuRepository";

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
    return await importMenu();
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
      const title = data.title;
      const image = data.image || "";
      const large = data.large || false;
      const small = data.small || false;
      const category = data.category;

      // 価格構造を新しい形式で取得
      let price = {
        medium: 0,
        small: undefined as number | undefined,
        large: undefined as number | undefined,
      };

      if (data.price && typeof data.price === 'object' && !Array.isArray(data.price)) {
        // 新しいmap形式の場合
        price = {
          medium: data.price.medium || 0,
          small: data.price.small || undefined,
          large: data.price.large || undefined,
        };
      }

      originalMenuList.push({
        id: id,
        title: title,
        price: price,
        image: image,
        large: large,
        small: small,
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
    const targetDate = new Date(year, month - 1);
    const allMenus = await this.getAllMenus();
    const originalMenuList = await this.getOriginalMenuList();

    const docMonthRef = doc(
      database,
      "funch_month",
      this.formatDateJST(targetDate, true)
    );
    const docMonthSnap = await getDoc(docMonthRef);

    if (docMonthSnap.exists()) {
      const data = docMonthSnap.data();

      const menuCodes = data.menu != undefined ? (data.menu as number[]) : [];
      const menus = menuCodes
        .map((m: number) => {
          return allMenus.find((menu) => menu.item_code == m);
        })
        .filter((m) => m != undefined) as Menu[];

      const originalMenuRefs =
        data.original_menu != undefined
          ? (data.original_menu as DocumentReference[])
          : [];
      const originalMenus = originalMenuRefs
        .map((ref) => {
          return originalMenuList.find((m) => m.id == ref.id);
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
    const targetDate = new Date(year, month - 1);
    const menuItemCodes = menus.map((m) => m.item_code);
    const originalMenuIds = originalMenus.map((m) =>
      doc(database, "funch_original_menu", m.id)
    );

    const id = this.formatDateJST(targetDate, true);
    await setDoc(doc(database, "funch_month", id), {
      year: year,
      month: month,
      menu: menuItemCodes,
      original_menu: originalMenuIds,
    });
  }
}
