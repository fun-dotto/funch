import {
  doc,
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { database } from "../infrastructure/firebase";
import { OriginalMenu } from "../types/Menu";
import { createPriceModel } from "../types/Price";

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
      title: menu.title,
      category: menu.category,
      price: priceMap,
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
      data.price &&
      typeof data.price === "object" &&
      !Array.isArray(data.price)
    ) {
      // 新しいmap形式の場合
      price = {
        medium: data.price.medium || 0,
        small: data.price.small || undefined,
        large: data.price.large || undefined,
      };
    } else if (
      data.price &&
      Array.isArray(data.price) &&
      data.price.length === 3
    ) {
      // 古い配列形式の場合（後方互換性）
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
      image: "",
      category: data.category,
    };
  }

  async deleteOriginalMenu(menuId: string): Promise<void> {
    const menuRef = doc(database, "funch_original_menu", menuId);
    await deleteDoc(menuRef);
  }
}
