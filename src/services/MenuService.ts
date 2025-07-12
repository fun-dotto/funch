import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import {
  Menu,
  OriginalMenu,
  MenuItem,
  getCategoryMenu,
  convertOriginalMenuToMenuItem,
} from "../types/Menu";
import { getBytes, ref } from "firebase/storage";
import { storage } from "../infrastructure/firebase";
import { OriginalMenuCRUDService } from "./OriginalMenuCRUDService";

type MenuResponse = {
  menus: MenuItem[];
};

export class MenuService {
  private originalMenuCRUDService: OriginalMenuCRUDService;

  constructor(private menuRepository: MenuRepository) {
    this.originalMenuCRUDService = new OriginalMenuCRUDService();
  }

  async getAllMenus(): Promise<Menu[]> {
    return await this.menuRepository.getAllMenus();
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    return await this.menuRepository.getOriginalMenus();
  }

  getCategoryMenus(allMenus: Menu[], categoryCode: number): Menu[] {
    return getCategoryMenu(allMenus, categoryCode);
  }

  async getRawMenuWithPrices(): Promise<MenuItem[]> {
    const pathReference = ref(storage, "funch/menu.json");
    const bytes = await getBytes(pathReference);
    const jsonString = new TextDecoder().decode(bytes);
    const jsonData: {
      item_code: number;
      title: string;
      price: { large?: number; medium: number; small?: number };
      image: string;
      category: number;
      large: boolean;
      small: boolean;
      energy: number;
    }[] = JSON.parse(jsonString);

    return jsonData.map((data) => {
      const prices: { small?: number; medium: number; large?: number } = {
        medium: data.price.medium,
      };

      if (data.price.small) {
        prices.small = data.price.small;
      }
      if (data.price.large) {
        prices.large = data.price.large;
      }

      return {
        name: data.title,
        category_id: data.category,
        prices,
        id: data.item_code,
      };
    });
  }

  async getFormattedMenus(): Promise<MenuResponse> {
    const rawMenus = await this.getRawMenuWithPrices();

    return {
      menus: rawMenus.sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  async getFormattedOriginalMenus(): Promise<MenuResponse> {
    const originalMenus = await this.getOriginalMenus();

    return {
      menus: originalMenus
        .map((originalMenu) => convertOriginalMenuToMenuItem(originalMenu))
        .sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  async createOriginalMenu(
    menuData: Omit<OriginalMenu, "id">
  ): Promise<OriginalMenu> {
    const newMenu: OriginalMenu = {
      ...menuData,
      id: "0", // OriginalMenuCRUDServiceが新規作成として認識
    };
    return await this.originalMenuCRUDService.saveOriginalMenu(newMenu);
  }

  async updateOriginalMenu(
    id: string,
    menuData: Omit<OriginalMenu, "id">
  ): Promise<OriginalMenu> {
    const updatedMenu: OriginalMenu = {
      ...menuData,
      id,
    };
    return await this.originalMenuCRUDService.saveOriginalMenu(updatedMenu);
  }

  async deleteOriginalMenu(id: string): Promise<void> {
    return await this.originalMenuCRUDService.deleteOriginalMenu(id);
  }
}
