import { MenuRepository } from "../interfaces/MenuRepository";
import { Menu, OriginalMenu } from "../../types/Menu";
import { PriceModel } from "../../types/Price";
import { getBytes, ref } from "firebase/storage";
import { storage, database } from "../../infrastructure/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  DocumentReference,
} from "firebase/firestore";

export class FirebaseMenuRepository implements MenuRepository {
  async getAllMenus(): Promise<Menu[]> {
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

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    const docOriginalMenuRef = query(
      collection(database, "funch_original_menu")
    );
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);

    const originalMenus: OriginalMenu[] = [];
    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title;
      const image = data.image;
      const category = data.category;

      // 新しい価格構造に対応
      let price = {
        medium: 0,
        small: undefined as number | undefined,
        large: undefined as number | undefined,
      };

      if (data.price && Array.isArray(data.price) && data.price.length === 3) {
        price = {
          small: data.price[0] > 0 ? data.price[0] : undefined,
          medium: data.price[1],
          large: data.price[2] > 0 ? data.price[2] : undefined,
        };
      }

      originalMenus.push({
        id: id,
        title: title,
        price: price,
        image: image,
        category: category,
      });
    });

    return originalMenus;
  }

  async getPrices(): Promise<PriceModel[]> {
    const docPriceRef = query(collection(database, "funch_original_price"));
    const docPriceSnap = await getDocs(docPriceRef);

    const priceList: PriceModel[] = [];
    docPriceSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const category = data.category;
      const name = data.name;
      const price = data.price as [number, number, number];

      priceList.push({
        id,
        category,
        name,
        price,
      });
    });

    return priceList;
  }
}
