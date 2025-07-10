import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { OriginalMenu } from "../types/Menu";
import { createPriceModel } from "../types/Price";

export class OriginalMenuCRUDService {
  
  async saveOriginalMenu(menu: OriginalMenu): Promise<string> {
    // 価格配列を作成 [小, 中, 大]
    const priceArray: [number, number, number] = [
      menu.price.small || 0,
      menu.price.medium,
      menu.price.large || 0
    ];

    const menuData = {
      title: menu.title,
      category: menu.category,
      large: menu.large,
      small: menu.small,
      image: menu.image,
      price: priceArray
    };

    if (menu.id && menu.id !== "0") {
      // 既存メニューの更新
      const menuRef = doc(database, "funch_original_menu", menu.id);
      await updateDoc(menuRef, menuData);
      return menu.id;
    } else {
      // 新規メニューの作成
      const newMenuRef = await addDoc(collection(database, "funch_original_menu"), menuData);
      return newMenuRef.id;
    }
  }

  convertFirebaseDataToMenu(id: string, data: any): OriginalMenu {
    // Firebaseのデータを OriginalMenu 形式に変換
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
    
    return {
      id,
      title: data.title,
      price,
      image: data.image || "",
      large: data.large || false,
      small: data.small || false,
      category: data.category,
    };
  }
}