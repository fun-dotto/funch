import { MenuItem, Menu, OriginalMenu } from "../types/Menu";

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
        const existingOriginalMenuIds = existingData.original_menu_ids || {};

        if (existingOriginalMenuIds[menuItem.id] === false) {
          // falseの場合はデータを削除
          const { [menuItem.id]: _, ...updatedOriginalMenuIds } =
            existingOriginalMenuIds;
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        } else if (existingOriginalMenuIds[menuItem.id] === undefined) {
          // データがない場合のみtrueを追加
          const updatedOriginalMenuIds = {
            ...existingOriginalMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        }
      } else {
        // 通常メニューの場合
        const existingCommonMenuIds = existingData.common_menu_ids || {};

        if (existingCommonMenuIds[menuItem.id] === false) {
          // falseの場合はデータを削除
          const { [menuItem.id]: _, ...updatedCommonMenuIds } =
            existingCommonMenuIds;
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        } else if (existingCommonMenuIds[menuItem.id] === undefined) {
          // データがない場合のみtrueを追加
          const updatedCommonMenuIds = {
            ...existingCommonMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        }
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
        const existingOriginalMenuIds = existingData.original_menu_ids || {};

        if (existingOriginalMenuIds[menuItem.id] === false) {
          // falseの場合はデータを削除
          const { [menuItem.id]: _, ...updatedOriginalMenuIds } =
            existingOriginalMenuIds;
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        } else if (existingOriginalMenuIds[menuItem.id] === undefined) {
          // データがない場合のみtrueを追加
          const updatedOriginalMenuIds = {
            ...existingOriginalMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        }
      } else {
        // 通常メニューの場合
        const existingCommonMenuIds = existingData.common_menu_ids || {};

        if (existingCommonMenuIds[menuItem.id] === false) {
          // falseの場合はデータを削除
          const { [menuItem.id]: _, ...updatedCommonMenuIds } =
            existingCommonMenuIds;
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        } else if (existingCommonMenuIds[menuItem.id] === undefined) {
          // データがない場合のみtrueを追加
          const updatedCommonMenuIds = {
            ...existingCommonMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        }
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

  // 日次削除メニューをFirestoreに保存（falseフラグで削除を記録）
  async saveDailyDeletion(date: Date, menuItem: MenuItem): Promise<void> {
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
      // 既存ドキュメントがある場合は削除フラグを追加
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        // オリジナルメニューの削除フラグを追加
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        // 通常メニューの削除フラグを追加
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      // 新規ドキュメント作成（削除フラグのみ）
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: false },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: false } : {},
        date: Timestamp.fromDate(date),
      };

      await setDoc(docRef, saveData);
    }
  }

  // 月次削除メニューをFirestoreに保存（falseフラグで削除を記録）
  async saveMonthlyDeletion(
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
      // 既存ドキュメントがある場合は削除フラグを追加
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        // オリジナルメニューの削除フラグを追加
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        // 通常メニューの削除フラグを追加
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      // 新規ドキュメント作成（削除フラグのみ）
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: false },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: false } : {},
        date: Timestamp.fromDate(firstDayOfMonth),
      };

      await setDoc(docRef, saveData);
    }
  }

  // 年月を YYYYMM 形式の文字列に変換
  private formatMonthToString(year: number, month: number): string {
    return `${year}${String(month).padStart(2, "0")}`;
  }

  // 日次変更データを取得
  async getDailyChangeData(date: Date): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    const { doc, getDoc } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        commonMenuIds: data.common_menu_ids || {},
        originalMenuIds: data.original_menu_ids || {},
      };
    }

    return {
      commonMenuIds: {},
      originalMenuIds: {},
    };
  }

  // 月次変更データを取得
  async getMonthlyChangeData(
    year: number,
    month: number
  ): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    const { doc, getDoc } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");

    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        commonMenuIds: data.common_menu_ids || {},
        originalMenuIds: data.original_menu_ids || {},
      };
    }

    return {
      commonMenuIds: {},
      originalMenuIds: {},
    };
  }

  // 🚀 新機能: 重複チェック付き日次追加
  async saveDailyChangeWithDuplicateCheck(
    date: Date, 
    menuItem: MenuItem,
    existingMenuData: Menu[],
    existingOriginalMenuData: OriginalMenu[],
    existingChangeData: { commonMenuIds: Record<string, boolean>, originalMenuIds: Record<string, boolean> }
  ): Promise<'added' | 'revived' | 'ignored'> {
    
    const isOriginalMenu = typeof menuItem.id === "string";
    
    // 1. menuに既存かチェック
    const existsInMenu = isOriginalMenu 
      ? existingOriginalMenuData.some(m => m.id === menuItem.id)
      : existingMenuData.some(m => m.item_code.toString() === menuItem.id.toString());
    
    if (existsInMenu) {
      // 2. 削除フラグチェック
      const hasDeletionFlag = isOriginalMenu
        ? existingChangeData.originalMenuIds[menuItem.id] === false
        : existingChangeData.commonMenuIds[menuItem.id] === false;
      
      if (hasDeletionFlag) {
        // 3a. 削除フラグ除去（復活）
        await this.removeChangeEntry(date, menuItem.id, isOriginalMenu);
        return 'revived';
      } else {
        // 3b. 何もしない（重複回避）- changeに追加しない
        return 'ignored';
      }
    } else {
      // 4. menuに存在しない場合のみ通常の追加処理
      await this.saveDailyChange(date, menuItem);
      return 'added';
    }
  }

  // 重複チェック付き月間追加
  async saveMonthlyChangeWithDuplicateCheck(
    year: number,
    month: number,
    menuItem: MenuItem,
    existingMenuData: Menu[],
    existingOriginalMenuData: OriginalMenu[],
    existingChangeData: { commonMenuIds: Record<string, boolean>, originalMenuIds: Record<string, boolean> }
  ): Promise<'added' | 'revived' | 'ignored'> {
    
    const isOriginalMenu = typeof menuItem.id === "string";
    
    // 1. menuに既存かチェック
    const existsInMenu = isOriginalMenu 
      ? existingOriginalMenuData.some(m => m.id === menuItem.id)
      : existingMenuData.some(m => m.item_code.toString() === menuItem.id.toString());
    
    if (existsInMenu) {
      // 2. 削除フラグチェック
      const hasDeletionFlag = isOriginalMenu
        ? existingChangeData.originalMenuIds[menuItem.id] === false
        : existingChangeData.commonMenuIds[menuItem.id] === false;
      
      if (hasDeletionFlag) {
        // 3a. 削除フラグ除去（復活）
        await this.removeMonthlyChangeEntry(year, month, menuItem.id, isOriginalMenu);
        return 'revived';
      } else {
        // 3b. 何もしない（重複回避）- changeに追加しない
        return 'ignored';
      }
    } else {
      // 4. menuに存在しない場合のみ通常の追加処理
      await this.saveMonthlyChange(year, month, menuItem);
      return 'added';
    }
  }

  // 日次変更エントリ除去
  private async removeChangeEntry(date: Date, menuId: string | number, isOriginalMenu: boolean): Promise<void> {
    const { doc, updateDoc, deleteField } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");
    
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);
    
    const fieldPath = isOriginalMenu 
      ? `original_menu_ids.${menuId}`
      : `common_menu_ids.${menuId}`;
    
    await updateDoc(docRef, {
      [fieldPath]: deleteField()
    });
  }

  // 月間変更エントリ除去
  private async removeMonthlyChangeEntry(year: number, month: number, menuId: string | number, isOriginalMenu: boolean): Promise<void> {
    const { doc, updateDoc, deleteField } = await import("firebase/firestore");
    const { database } = await import("../infrastructure/firebase");
    
    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);
    
    const fieldPath = isOriginalMenu 
      ? `original_menu_ids.${menuId}`
      : `common_menu_ids.${menuId}`;
    
    await updateDoc(docRef, {
      [fieldPath]: deleteField()
    });
  }

  // 🚀 日次変更のリバート処理（change要素の削除）
  async revertDailyChange(date: Date, menuId: string, isCommonMenu: boolean): Promise<void> {
    await this.removeChangeEntry(date, menuId, !isCommonMenu);
  }
}
