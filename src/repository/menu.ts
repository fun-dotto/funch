// import * as wanakana from "wanakana";
import { getBytes, ref } from "firebase/storage";
import { storage } from "../infrastructure/firebase";

export class Menu {
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
    energy: number
  ) {
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

export const importMenu = async () => {
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
};

export const getCategoryMenu = (allMenu: Menu[], category_code: number) => {
  const c = allMenu.filter((m) => m.category == category_code);
  return c.sort(menuSort);
};

const menuSort = (a: Menu, b: Menu) => {
  // 軽量化のため、10文字までで比較
  // const diff = wanakana
  //   .toKana(a.title.slice(0, 10))
  //   .localeCompare(wanakana.toKana(b.display_name_roman.slice(0, 10)), "ja");
  // if (diff != 0) {
  //   return diff;
  // }
  return a.title.localeCompare(b.title, "ja");
};

type PriceStructure = {
  small?: number;
  medium: number;
  large?: number;
};

export type OriginalMenu = {
  id: string;
  title: string;
  price: PriceStructure;
  image: string;
  large: boolean;
  small: boolean;
  category: number;
};

export type OriginalMenuNull = {
  id?: string;
  title: string;
  price?: PriceStructure;
  image: string;
  large: boolean;
  small: boolean;
  category?: number;
};
