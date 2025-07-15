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
    changeData: Map<
      UniqueIdentifier,
      {
        commonMenuIds: Record<string, boolean>;
        originalMenuIds: Record<string, boolean>;
      }
    >;
  }> {
    const targetDay = new Date(year, month - 1);
    const monthStartDay = new Date(targetDay);
    monthStartDay.setDate(1);
    const monthEndDay = new Date(targetDay);
    monthEndDay.setMonth(targetDay.getMonth() + 1, 0);

    const { menuData, originalMenuData } =
      await this.calendarMenuRepository.getDailyMenuData(
        monthStartDay,
        monthEndDay
      );

    // 各日の変更データを取得
    const changeData = new Map<
      UniqueIdentifier,
      {
        commonMenuIds: Record<string, boolean>;
        originalMenuIds: Record<string, boolean>;
      }
    >();

    // カレンダーの各日について変更データを取得
    const currentDate = new Date(monthStartDay);
    while (currentDate <= monthEndDay) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // 平日のみ
        const dateOptions: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        };
        const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(
          currentDate
        );

        const dailyChangeData = await this.changeMenuService.getDailyChangeData(
          new Date(currentDate)
        );
        changeData.set(dateId, dailyChangeData);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { menuData, originalMenuData, changeData };
  }

  async deleteDailyMenu(date: Date, menuItemCode: number): Promise<void> {
    // 削除フラグをfunch_daily_changeに記録（Firestoreからは削除しない）
    const menuItem: MenuItem = {
      id: menuItemCode,
      name: "",
      category_id: 0,
      prices: { medium: 0 },
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
      prices: { medium: 0 },
    };
    await this.changeMenuService.saveDailyDeletion(date, menuItem);
  }

  // 🚀 最適化: 特定日の変更データのみを取得
  async getSingleDayChangeData(date: Date): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    return await this.changeMenuService.getDailyChangeData(date);
  }
}
