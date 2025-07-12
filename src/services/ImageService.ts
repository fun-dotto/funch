import { FirebaseImageRepository } from "../repositories/firebase/ImageRepository";

export class ImageService {
  private imageRepository: FirebaseImageRepository;

  constructor() {
    this.imageRepository = new FirebaseImageRepository();
  }

  private async resizeImage(
    file: File,
    width: number,
    height: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // 画像を指定サイズでリサイズ
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error("画像のリサイズに失敗しました"));
              }
            },
            file.type,
            0.9
          );
        } else {
          reject(new Error("Canvas context の取得に失敗しました"));
        }
      };

      img.onerror = () => {
        reject(new Error("画像の読み込みに失敗しました"));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async uploadMenuImage(menuId: string, file: File): Promise<string> {
    // ファイルタイプをバリデーション
    if (!file.type.startsWith("image/")) {
      throw new Error("画像ファイルを選択してください");
    }

    // ファイルサイズをバリデーション（5MB以下）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("画像サイズは5MB以下にしてください");
    }

    // 画像を764×540にリサイズ
    const resizedFile = await this.resizeImage(file, 764, 540);

    // 既存の画像を削除
    await this.deleteMenuImage(menuId);

    // 新しい画像をアップロード
    return await this.imageRepository.uploadImage(menuId, resizedFile);
  }

  async getMenuImageUrl(
    menuId: string,
    fileName: string
  ): Promise<string | null> {
    return await this.imageRepository.getImageUrl(menuId, fileName);
  }

  async getMenuImageUrlById(menuId: string): Promise<string | null> {
    // 一般的な画像拡張子で試行
    const commonExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    for (const ext of commonExtensions) {
      try {
        const url = await this.imageRepository.getImageUrl(
          menuId,
          `dummy.${ext}`
        );
        if (url) {
          return url;
        }
      } catch (error) {
        // 画像が存在しない場合は続行
        continue;
      }
    }

    return null;
  }

  async deleteMenuImage(menuId: string): Promise<void> {
    await this.imageRepository.deleteImageByMenuId(menuId);
  }

  async deleteMenuImageByFileName(
    menuId: string,
    fileName: string
  ): Promise<void> {
    await this.imageRepository.deleteImage(menuId, fileName);
  }
}
