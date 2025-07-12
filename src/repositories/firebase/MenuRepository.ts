import { MenuRepository } from "../interfaces/MenuRepository";
import { Menu, OriginalMenu } from "../../types/Menu";
import { getBytes, ref } from "firebase/storage";
import { storage, database } from "../../infrastructure/firebase";
import { collection, getDocs, query } from "firebase/firestore";

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
      const title = data.name; // name フィールドから取得
      const category = data.category_id; // category_id フィールドから取得

      // 新しい価格構造に対応
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

      originalMenus.push({
        id: id,
        title: title,
        price: price,
        category: category,
      });
    });

    return originalMenus;
  }
}
