import { Menu, OriginalMenu } from "../../types/Menu";

export interface MonthMenuRepository {
  getMonthMenuData(
    year: number,
    month: number
  ): Promise<{
    menus: Menu[];
    originalMenus: OriginalMenu[];
  }>;
  saveMonthMenuData(
    year: number,
    month: number,
    menus: Menu[],
    originalMenus: OriginalMenu[]
  ): Promise<void>;
}
