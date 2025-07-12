import { Menu, OriginalMenu } from "../../types/Menu";
import { UniqueIdentifier } from "@dnd-kit/core";

export interface CalendarMenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getOriginalMenuList(): Promise<OriginalMenu[]>;
  getDailyMenuData(
    startDate: Date,
    endDate: Date
  ): Promise<{
    menuData: Map<UniqueIdentifier, Menu[]>;
    originalMenuData: Map<UniqueIdentifier, OriginalMenu[]>;
  }>;
  removeDailyMenu(date: Date, menuItemCode: number): Promise<void>;
  removeDailyOriginalMenu(date: Date, originalMenuId: string): Promise<void>;
}