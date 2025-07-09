import { Menu, OriginalMenu } from "../../repository/menu";
import { PriceModel } from "../../repository/price";
import { UniqueIdentifier } from "@dnd-kit/core";

export interface CalendarMenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getPriceList(): Promise<PriceModel[]>;
  getOriginalMenuList(): Promise<OriginalMenu[]>;
  getDailyMenuData(
    startDate: Date,
    endDate: Date
  ): Promise<{
    menuData: Map<UniqueIdentifier, Menu[]>;
    originalMenuData: Map<UniqueIdentifier, OriginalMenu[]>;
  }>;
}