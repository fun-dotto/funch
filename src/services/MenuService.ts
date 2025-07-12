import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import { Menu, OriginalMenu, UnifiedMenuItem, getCategoryMenu } from "../types/Menu";
import { getBytes, ref } from "firebase/storage";
import { storage } from "../infrastructure/firebase";

type MenuResponse = {
  menus: UnifiedMenuItem[];
};

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


  async getRawMenuWithPrices(): Promise<UnifiedMenuItem[]> {
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
        medium: data.price.medium
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
        id: data.item_code
      };
    });
  }

  private convertOriginalMenuToUnified(originalMenu: OriginalMenu): UnifiedMenuItem {
    return {
      name: originalMenu.title,
      category_id: originalMenu.category,
      prices: originalMenu.price,
      id: originalMenu.id
    };
  }

  async getFormattedMenus(): Promise<MenuResponse> {
    const rawMenus = await this.getRawMenuWithPrices();
    
    return {
      menus: rawMenus.sort((a, b) => a.name.localeCompare(b.name, "ja"))
    };
  }

  async getFormattedOriginalMenus(): Promise<MenuResponse> {
    const originalMenus = await this.getOriginalMenus();
    
    return {
      menus: originalMenus.map(originalMenu => this.convertOriginalMenuToUnified(originalMenu))
        .sort((a, b) => a.name.localeCompare(b.name, "ja"))
    };
  }
}