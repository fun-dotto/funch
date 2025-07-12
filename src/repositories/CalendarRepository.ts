import {
  collection,
  DocumentReference,
  getDocs,
  query,
  Timestamp,
  where,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { importMenu, Menu, OriginalMenu } from "../repository/menu";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuRepository } from "./interfaces/CalendarMenuRepository";

export class FirebaseCalendarMenuRepository implements CalendarMenuRepository {
  async getAllMenus(): Promise<Menu[]> {
    return await importMenu();
  }

  async getOriginalMenuList(): Promise<OriginalMenu[]> {
    const docOriginalMenuRef = collection(database, "funch_original_menu");
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
    const originalMenuList: OriginalMenu[] = [];
    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title;
      const image = data.image || "";
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
        large: data.large || false,
        small: data.small || false,
        category: category,
      });
    });
    return originalMenuList;
  }

  async getDailyMenuData(
    startDate: Date,
    endDate: Date
  ): Promise<{
    menuData: Map<UniqueIdentifier, Menu[]>;
    originalMenuData: Map<UniqueIdentifier, OriginalMenu[]>;
  }> {
    const allMenus = await this.getAllMenus();
    const originalMenuList = await this.getOriginalMenuList();

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    const docRef = query(
      collection(database, "funch_day"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );
    const docSnap = await getDocs(docRef);

    const menuData = new Map<UniqueIdentifier, Menu[]>();
    const originalMenuData = new Map<UniqueIdentifier, OriginalMenu[]>();

    docSnap.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.date.seconds * 1000);
      const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

      // 通常メニュー
      const menuCodes = data.menu != undefined ? (data.menu as number[]) : [];
      const menus = menuCodes
        .map((m: number) => {
          return allMenus.find((menu) => menu.item_code == m);
        })
        .filter((m) => m != undefined) as Menu[];
      menuData.set(dateId, menus);

      // オリジナルメニュー
      const originalMenuRefs =
        data.original_menu != undefined
          ? (data.original_menu as DocumentReference[])
          : [];
      const originalMenus = originalMenuRefs
        .map((ref) => {
          return originalMenuList.find((m) => m.id == ref.id);
        })
        .filter((m) => m != undefined) as OriginalMenu[];
      originalMenuData.set(dateId, originalMenus);
    });

    return { menuData, originalMenuData };
  }

  async removeDailyMenu(date: Date, menuItemCode: number): Promise<void> {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
    const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

    // 該当する日付のドキュメントを取得
    const docRef = query(
      collection(database, "funch_day"),
      where("date", "==", Timestamp.fromDate(date))
    );
    const docSnap = await getDocs(docRef);

    if (!docSnap.empty) {
      const docData = docSnap.docs[0];
      const docId = docData.id;

      // メニューコードを配列から削除
      await updateDoc(doc(database, "funch_day", docId), {
        menu: arrayRemove(menuItemCode),
      });
    }
  }

  async removeDailyOriginalMenu(
    date: Date,
    originalMenuId: string
  ): Promise<void> {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };
    const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(date);

    // 該当する日付のドキュメントを取得
    const docRef = query(
      collection(database, "funch_day"),
      where("date", "==", Timestamp.fromDate(date))
    );
    const docSnap = await getDocs(docRef);

    if (!docSnap.empty) {
      const docData = docSnap.docs[0];
      const docId = docData.id;

      // オリジナルメニューの参照を配列から削除
      const originalMenuRef = doc(
        database,
        "funch_original_menu",
        originalMenuId
      );
      await updateDoc(doc(database, "funch_day", docId), {
        original_menu: arrayRemove(originalMenuRef),
      });
    }
  }
}
