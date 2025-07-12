import { Menu, OriginalMenu } from "../../types/Menu";

export interface MenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getOriginalMenus(): Promise<OriginalMenu[]>;
}