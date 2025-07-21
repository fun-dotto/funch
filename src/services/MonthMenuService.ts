import { Menu, OriginalMenu } from "../types/Menu";
import { MonthMenuRepository } from "../repositories/interfaces/MonthMenuRepository";

export class MonthMenuService {
  constructor(private monthMenuRepository: MonthMenuRepository) {}

  async getMonthMenuData(
    year: number,
    month: number
  ): Promise<{
    menus: Menu[];
    originalMenus: OriginalMenu[];
  }> {
    if (month <= 0 || month > 12 || year < 2024) {
      throw new Error("Invalid year or month");
    }

    return await this.monthMenuRepository.getMonthMenuData(year, month);
  }

  async saveMonthMenuData(
    year: number,
    month: number,
    menus: Menu[],
    originalMenus: OriginalMenu[]
  ): Promise<void> {
    if (month <= 0 || month > 12 || year < 2024) {
      throw new Error("Invalid year or month");
    }

    await this.monthMenuRepository.saveMonthMenuData(
      year,
      month,
      menus,
      originalMenus
    );
  }

}
