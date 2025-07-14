import { Menu, OriginalMenu, MenuItem } from "../types/Menu";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuRepository } from "../repositories/interfaces/CalendarMenuRepository";
import { ChangeMenuService } from "./ChangeMenuService";

export class CalendarMenuService {
  private changeMenuService: ChangeMenuService;

  constructor(private calendarMenuRepository: CalendarMenuRepository) {
    this.changeMenuService = new ChangeMenuService();
  }

  async getMonthMenuData(
    year: number,
    month: number
  ): Promise<{
    menuData: Map<UniqueIdentifier, Menu[]>;
    originalMenuData: Map<UniqueIdentifier, OriginalMenu[]>;
  }> {
    const targetDay = new Date(year, month - 1);
    const monthStartDay = new Date(targetDay);
    monthStartDay.setDate(1);
    const monthEndDay = new Date(targetDay);
    monthEndDay.setMonth(targetDay.getMonth() + 1, 0);

    return await this.calendarMenuRepository.getDailyMenuData(
      monthStartDay,
      monthEndDay
    );
  }

  async deleteDailyMenu(date: Date, menuItemCode: number): Promise<void> {
    // 削除フラグをfunch_daily_changeに記録（Firestoreからは削除しない）
    const menuItem: MenuItem = { 
      id: menuItemCode,
      name: "",
      category_id: 0,
      prices: { medium: 0 }
    };
    await this.changeMenuService.saveDailyDeletion(date, menuItem);
  }

  async deleteDailyOriginalMenu(
    date: Date,
    originalMenuId: string
  ): Promise<void> {
    // 削除フラグをfunch_daily_changeに記録（Firestoreからは削除しない）
    const menuItem: MenuItem = { 
      id: originalMenuId,
      name: "",
      category_id: 0,
      prices: { medium: 0 }
    };
    await this.changeMenuService.saveDailyDeletion(date, menuItem);
  }
}
