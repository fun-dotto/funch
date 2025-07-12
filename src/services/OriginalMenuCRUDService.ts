import {
  doc,
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { OriginalMenu } from "../types/Menu";

export class OriginalMenuCRUDService {
  async saveOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu> {
    // 価格mapを作成（存在するサイズのみ）
    const priceMap: { [key: string]: number } = {};

    // 中サイズは必須
    priceMap.medium = menu.price.medium;

    // 大・小サイズは存在する場合のみ追加
    if (menu.price.large && menu.price.large > 0) {
      priceMap.large = menu.price.large;
    }
    if (menu.price.small && menu.price.small > 0) {
      priceMap.small = menu.price.small;
    }

    const menuData = {
      name: menu.title,           // title → name
      category_id: menu.category, // category → category_id
      prices: priceMap,          // price → prices
    };

    if (menu.id && menu.id !== "0") {
      // 既存メニューの更新
      const menuRef = doc(database, "funch_original_menu", menu.id);
      await updateDoc(menuRef, menuData);
      return menu;
    } else {
      // 新規メニューの作成
      const newMenuRef = await addDoc(
        collection(database, "funch_original_menu"),
        menuData
      );
      return {
        ...menu,
        id: newMenuRef.id,
      };
    }
  }

  convertFirebaseDataToMenu(id: string, data: any): OriginalMenu {
    // Firebaseのデータを OriginalMenu 形式に変換
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
      // 新しいprices形式の場合
      price = {
        medium: data.prices.medium || 0,
        small: data.prices.small || undefined,
        large: data.prices.large || undefined,
      };
    }

    return {
      id,
      title: data.name,           // name → title
      price,
      category: data.category_id, // category_id → category
    };
  }

  async deleteOriginalMenu(menuId: string): Promise<void> {
    const menuRef = doc(database, "funch_original_menu", menuId);
    await deleteDoc(menuRef);
  }
}
