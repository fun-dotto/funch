
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

export type OriginalMenu = {
  id: string;
  title: string;
  price: {
    small?: number;
    medium: number;
    large?: number;
  };
  image: string;
  large: boolean;
  small: boolean;
  category: number;
};

export const getCategoryMenu = (allMenu: Menu[], category_code: number) => {
  const c = allMenu.filter((m) => m.category == category_code);
  return c.sort(menuSort);
};

const menuSort = (a: Menu, b: Menu) => {
  return a.title.localeCompare(b.title, "ja");
};