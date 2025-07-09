import { 
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  DocumentReference 
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { Menu, OriginalMenu, importMenu } from "../repository/menu";
import { PriceModel } from "../repository/price";
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

  private async getPriceList(): Promise<PriceModel[]> {
    const docPriceRef = query(
      collection(database, "funch_price"),
      orderBy("medium", "desc")
    );
    const docPriceSnap = await getDocs(docPriceRef);
    const priceList: PriceModel[] = [];
    docPriceSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const small = data.small;
      const medium = data.medium;
      const large = data.large;
      const categories = data.categories as number[];
      priceList.push({ id, small, medium, large, categories });
    });
    return priceList;
  }

  private async getOriginalMenuList(): Promise<OriginalMenu[]> {
    const priceList = await this.getPriceList();
    const originalMenuList: OriginalMenu[] = [];
    
    const docOriginalMenuRef = query(
      collection(database, "funch_original_menu")
    );
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
    
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
        10002, 12057, 12075, 17364, 17366, 17390, 17392, 7051, 7053, 7052,
        8001,
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