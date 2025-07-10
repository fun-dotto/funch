import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import { OriginalMenu } from "../types/Menu";

export class OriginalMenuService {
  constructor(private menuRepository: MenuRepository) {}

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    return await this.menuRepository.getOriginalMenus();
  }

  sortByCategory(originalMenus: OriginalMenu[]): OriginalMenu[] {
    return originalMenus.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category - b.category;
      }
      return a.title.localeCompare(b.title, "ja");
    });
  }

  filterByCategory(originalMenus: OriginalMenu[], category: number): OriginalMenu[] {
    return originalMenus.filter(menu => menu.category === category);
  }
}