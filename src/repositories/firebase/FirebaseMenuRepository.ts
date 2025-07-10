import { MenuRepository } from "../interfaces/MenuRepository";
import { Menu, OriginalMenu } from "../../types/Menu";
import { PriceModel } from "../../types/Price";
import { getBytes, ref } from "firebase/storage";
import { storage, database } from "../../infrastructure/firebase";
import { collection, getDocs, orderBy, query, doc, DocumentReference } from "firebase/firestore";

export class FirebaseMenuRepository implements MenuRepository {
  async getAllMenus(): Promise<Menu[]> {
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
      return new Menu(
        data.item_code,
        data.title,
        data.price.medium,
        data.image,
        data.category,
        data.large,
        data.small,
        data.energy
      );
    });
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    const prices = await this.getPrices();
    
    const docOriginalMenuRef = query(
      collection(database, "funch_original_menu")
    );
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
    
    const originalMenus: OriginalMenu[] = [];
    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title;
      const priceId = data.price.id;
      const price = prices.find((price) => price.id === priceId);
      const image = data.image;
      const large = data.large;
      const small = data.small;
      const category = data.category;
      
      if (price != null) {
        originalMenus.push({
          id: id,
          title: title,
          price: price,
          image: image,
          large: large,
          small: small,
          category: category,
        });
      }
    });
    
    return originalMenus;
  }

  async getPrices(): Promise<PriceModel[]> {
    const docPriceRef = query(
      collection(database, "funch_price"),
      orderBy("medium", "desc")
    );
    const docPriceSnap = await getDocs(docPriceRef);
    
    const priceList: PriceModel[] = [];
    docPriceSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const small = data.small;
      const medium = data.medium;
      const large = data.large;
      const categories = data.categories as number[];
      priceList.push({ id, small, medium, large, categories });
    });
    
    return priceList;
  }
}