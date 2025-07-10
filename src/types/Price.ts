export type PriceModel = {
  id: string;
  category: number;
  name: string;
  price: [number, number, number]; // [小, 中, 大]
};

// 便利な関数
export const getPriceFromModel = (priceModel: PriceModel) => {
  return {
    small: priceModel.price[0] || undefined,
    medium: priceModel.price[1],
    large: priceModel.price[2] || undefined,
  };
};

export const createPriceModel = (
  id: string,
  category: number,
  name: string,
  small: number = 0,
  medium: number,
  large: number = 0
): PriceModel => {
  return {
    id,
    category,
    name,
    price: [small, medium, large],
  };
};