import CoopData from "../assets/menu.json";
import * as wanakana from "wanakana";
import { PriceModel } from "./price";


export class Menu{
  status: number;
  size: string | null;
  item_code: number;
  display_name: string;
  display_name_roman: string;
  ingredients: string;
  price_kumika: number;
  image_url: string[];
  is_allergy_unconfirmed: boolean;
  allergy_codes: number[];
  category_code: number;
  group_code: string;
  is_nutritional_value_unconfirmed: boolean;
  // nutritionalvalue: Map<string, number>;

  constructor(status: number,
    size: string | null,
    item_code: number,
    display_name: string,
    display_name_roman: string,
    ingredients: string,
    price_kumika: number,
    image_url: string[],
    is_allergy_unconfirmed: boolean,
    allergy_codes: number[],
    category_code: number,
    group_code: string,
    is_nutritional_value_unconfirmed: boolean,
    // nutritionalvalue: Map<string, number>,
  ) {
    this.status = status;
    this.size = size;
    this.item_code = item_code;
    this.display_name = display_name;
    this.display_name_roman = display_name_roman;
    this.ingredients = ingredients;
    this.price_kumika = price_kumika;
    this.image_url = image_url;
    this.is_allergy_unconfirmed = is_allergy_unconfirmed;
    this.allergy_codes = allergy_codes;
    this.category_code = category_code;
    this.group_code = group_code;
    this.is_nutritional_value_unconfirmed = is_nutritional_value_unconfirmed;
    // this.nutritionalvalue = nutritionalvalue;
  };
}

export const importMenu = () => {
  return CoopData.map((data) => {
    return new Menu(
      data.status,
      data.size,
      Number(data.item_code),
      data.display_name,
      data.display_name_roman,
      data.ingredients,
      data.price_kumika,
      data.image_url,
      data.is_allergy_unconfirmed,
      data.allergy_codes.map((a) => Number(a)),
      Number(data.category_code),
      data.group_code,
      data.is_nutritional_value_unconfirmed,
      // data.nutritionalvalue,
    )
  });
}

export const getCategoryMenu = (category_code: number) => {
  const c = importMenu().filter((m) => m.category_code == category_code && !m.display_name.startsWith("(大)"));
  if (category_code != 7) {
    return c.filter((m) => m.size != "大" && m.size != "小" && m.size != "ミニ").sort(menuSort);
  }
  return c.sort(menuSort);
}

const menuSort = (a: Menu, b: Menu) => {
  // 軽量化のため、10文字までで比較
  const diff = wanakana.toKana(a.display_name_roman.slice(0, 10)).localeCompare(wanakana.toKana(b.display_name_roman.slice(0, 10)), 'ja');
  if (diff != 0) {
    return diff;
  }
  return a.display_name.localeCompare(b.display_name, 'ja');
}


export type OriginalMenu ={
  id: string;
  title: string;
  price: PriceModel;
  image: string;
  large: boolean;
  small: boolean;
  category: number;
}


export type OriginalMenuNull ={
  id?: string;
  title: string;
  price?: PriceModel;
  image: string;
  large: boolean;
  small: boolean;
  category?: number;
}
