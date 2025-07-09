import {
  collection,
  DocumentReference,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { importMenu, Menu, OriginalMenu } from "../repository/menu";
import { PriceModel } from "../repository/price";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuRepository } from "./interfaces/CalendarMenuRepository";

export class FirebaseCalendarMenuRepository implements CalendarMenuRepository {
  async getAllMenus(): Promise<Menu[]> {
    return await importMenu();
  }

  async getPriceList(): Promise<PriceModel[]> {
    const docPriceRef = collection(database, "funch_price");
    const docPriceSnap = await getDocs(docPriceRef);
    const newPriceList: PriceModel[] = [];
    docPriceSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const small = data.small;
      const medium = data.medium;
      const large = data.large;
      const categories = data.categories as number[];
      newPriceList.push({ id, small, medium, large, categories });
    });
    return newPriceList;
  }

  async getOriginalMenuList(): Promise<OriginalMenu[]> {
    const priceList = await this.getPriceList();
    const docOriginalMenuRef = collection(database, "funch_original_menu");
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
    const originalMenuList: OriginalMenu[] = [];
    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title;
      const priceId = data.price.id;
      const price = priceList.find((price) => price.id === priceId);
      const image = data.image;
      const large = data.large;
      const small = data.small;
      const category = data.category;
      if (price != null) {
        originalMenuList.push({
          id: id,
          title: title,
          price: price,
          image: image,
          large: large,
          small: small,
          category: category,
        });
      }
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
}