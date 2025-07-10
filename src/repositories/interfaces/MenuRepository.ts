import { Menu, OriginalMenu } from "../../types/Menu";
import { PriceModel } from "../../types/Price";

export interface MenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getOriginalMenus(): Promise<OriginalMenu[]>;
  getPrices(): Promise<PriceModel[]>;
}