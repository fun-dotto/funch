import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import { Menu, OriginalMenu, getCategoryMenu } from "../types/Menu";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async getAllMenus(): Promise<Menu[]> {
    return await this.menuRepository.getAllMenus();
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    return await this.menuRepository.getOriginalMenus();
  }

  getCategoryMenus(allMenus: Menu[], categoryCode: number): Menu[] {
    return getCategoryMenu(allMenus, categoryCode);
  }
}