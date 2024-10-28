import CoopData from "../assets/menu.json";



export class Menu{
  status: number;
  size: string | null;
  item_code: number;
  display_name: string;
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
    return c.filter((m) => m.size != "大" && m.size != "小" && m.size != "ミニ");
  }
  return c;
}