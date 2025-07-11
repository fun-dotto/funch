import { storage } from "../../infrastructure/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export class FirebaseImageRepository {
  private getImagePath(menuId: string, fileName: string): string {
    const extension = fileName.split(".").pop();
    return `funch/images/${menuId}.${extension}`;
  }

  async uploadImage(menuId: string, file: File): Promise<string> {
    try {
      const imagePath = this.getImagePath(menuId, file.name);
      const imageRef = ref(storage, imagePath);

      // 画像をアップロード
      await uploadBytes(imageRef, file);

      // ダウンロードURLを取得
      const downloadURL = await getDownloadURL(imageRef);

      return downloadURL;
    } catch (error) {
      console.error("画像のアップロードに失敗しました:", error);
      throw new Error("画像のアップロードに失敗しました");
    }
  }

  async getImageUrl(menuId: string, fileName: string): Promise<string | null> {
    try {
      const imagePath = this.getImagePath(menuId, fileName);
      const imageRef = ref(storage, imagePath);

      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      // 画像が存在しない場合はnullを返す
      console.warn("画像が見つかりません:", error);
      return null;
    }
  }

  async deleteImage(menuId: string, fileName: string): Promise<void> {
    try {
      const imagePath = this.getImagePath(menuId, fileName);
      const imageRef = ref(storage, imagePath);

      await deleteObject(imageRef);
    } catch (error) {
      console.error("画像の削除に失敗しました:", error);
      throw new Error("画像の削除に失敗しました");
    }
  }

  async deleteImageByMenuId(menuId: string): Promise<void> {
    // 既存の画像を削除するため、一般的な拡張子で試行
    const commonExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    for (const ext of commonExtensions) {
      try {
        const imagePath = `funch/images/${menuId}.${ext}`;
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        break; // 削除成功したらループを抜ける
      } catch (error) {
        // 画像が存在しない場合は続行
        continue;
      }
    }
  }
}
