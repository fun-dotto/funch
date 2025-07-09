import { Menu, OriginalMenu } from "../repository/menu";
import { UniqueIdentifier } from "@dnd-kit/core";
import { CalendarMenuRepository } from "../repositories/interfaces/CalendarMenuRepository";

export class CalendarMenuService {
  constructor(private calendarMenuRepository: CalendarMenuRepository) {}

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

    return await this.calendarMenuRepository.getDailyMenuData(monthStartDay, monthEndDay);
  }

  async deleteDailyMenu(date: Date, menuItemCode: number): Promise<void> {
    await this.calendarMenuRepository.removeDailyMenu(date, menuItemCode);
  }

  async deleteDailyOriginalMenu(date: Date, originalMenuId: string): Promise<void> {
    await this.calendarMenuRepository.removeDailyOriginalMenu(date, originalMenuId);
  }
}