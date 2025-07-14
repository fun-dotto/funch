import { MenuItem } from "../types/Menu";

export class ChangeMenuService {
  constructor() {}

  // 日次変更メニューをFirestoreに保存
  async saveDailyChange(date: Date, menuItem: MenuItem): Promise<void> {
    const { doc, getDoc, setDoc, updateDoc, Timestamp } = await import(
      "firebase/firestore"
    );
    const { database } = await import("../infrastructure/firebase");

    // 日付をYYYYMMDD形式に変換
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);

    // 既存ドキュメントを取得
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 既存ドキュメントがある場合は更新
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        // オリジナルメニューの場合
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: true,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        // 通常メニューの場合
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: true,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      // 新規ドキュメント作成
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: true },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: true } : {},
        date: Timestamp.fromDate(date),
      };

      await setDoc(docRef, saveData);
    }
  }

  // 月次変更メニューをFirestoreに保存
  async saveMonthlyChange(
    year: number,
    month: number,
    menuItem: MenuItem
  ): Promise<void> {
    const { doc, getDoc, setDoc, updateDoc, Timestamp } = await import(
      "firebase/firestore"
    );
    const { database } = await import("../infrastructure/firebase");

    // 月の1日0時0分を作成
    const firstDayOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);

    // 既存ドキュメントを取得
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 既存ドキュメントがある場合は更新
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        // オリジナルメニューの場合
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: true,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        // 通常メニューの場合
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: true,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      // 新規ドキュメント作成
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: true },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: true } : {},
        date: Timestamp.fromDate(firstDayOfMonth),
      };

      await setDoc(docRef, saveData);
    }
  }

  // Date を YYYYMMDD 形式の文字列に変換
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  // 年月を YYYYMM 形式の文字列に変換
  private formatMonthToString(year: number, month: number): string {
    return `${year}${String(month).padStart(2, "0")}`;
  }
}
