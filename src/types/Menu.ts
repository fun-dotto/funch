// ====== 統一型定義 ======
// API レスポンスで使用する統一されたメニュー型
export type MenuItem = {
  name: string;
  category_id: number;
  prices: {
    small?: number;
    medium: number;
    large?: number;
  };
  id: number | string;
};

// 価格構造の型エイリアス
export type PriceStructure = {
  small?: number;
  medium: number;
  large?: number;
};

// ====== 互換性維持のための既存型 ======
// Firebase Storage の menu.json 用（既存システムとの互換性維持）
export class Menu {
  id?: string;
  item_code: number;
  title: string;
  price_medium: number;
  image: string;
  category: number;
  large: boolean;
  small: boolean;
  energy: number;

  constructor(
    item_code: number,
    title: string,
    price_medium: number,
    image: string,
    category: number,
    large: boolean,
    small: boolean,
    energy: number,
    id?: string
  ) {
    this.id = id;
    this.item_code = item_code;
    this.title = title;
    this.price_medium = price_medium;
    this.image = image;
    this.category = category;
    this.large = large;
    this.small = small;
    this.energy = energy;
  }
}

// Firestore の original_menu 用（既存システムとの互換性維持）
export type OriginalMenu = {
  id: string;
  title: string;
  price: PriceStructure;
  category: number;
};

// ====== 型変換ユーティリティ ======
// Menu class から MenuItem への変換
export const convertMenuToMenuItem = (menu: Menu): MenuItem => ({
  name: menu.title,
  category_id: menu.category,
  prices: { medium: menu.price_medium },
  id: menu.item_code,
});

// OriginalMenu から MenuItem への変換
export const convertOriginalMenuToMenuItem = (
  originalMenu: OriginalMenu
): MenuItem => ({
  name: originalMenu.title,
  category_id: originalMenu.category,
  prices: originalMenu.price,
  id: originalMenu.id,
});

// ====== 既存の互換性関数 ======
export const getCategoryMenu = (allMenu: Menu[], category_code: number) => {
  const c = allMenu.filter((m) => m.category == category_code);
  return c.sort(menuSort);
};

const menuSort = (a: Menu, b: Menu) => {
  return a.title.localeCompare(b.title, "ja");
};
