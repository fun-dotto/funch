"use client";

import { FC, useState, useEffect } from "react";
import { OriginalMenu } from "../src/types/Menu";
import Select, { StylesConfig } from "react-select";
import { MdClose } from "react-icons/md";
import { Checkbox } from "./ui/checkbox";
import { PriceInput } from "./ui/PriceInput";
import { Button } from "./ui/button";
import { ImageUpload } from "./ui/ImageUpload";
import { ImageService } from "../src/services/ImageService";

type Option = {
  value: string;
  label: string;
};

type OriginalMenuEditFormProps = {
  menu: OriginalMenu;
  onCancel: () => void;
  onSave?: (updatedMenu: OriginalMenu, imageFile?: File) => void;
  onDelete?: (menuId: string) => void;
};

export const OriginalMenuEditForm: FC<OriginalMenuEditFormProps> = ({
  menu,
  onCancel,
  onSave,
  onDelete,
}) => {
  const [editMenu, setEditMenu] = useState<OriginalMenu>(menu);
  // チェックボックスの状態を独立して管理
  const [sizeEnabled, setSizeEnabled] = useState({
    large: !!menu.price.large,
    small: !!menu.price.small,
  });
  // 画像ファイルの状態管理
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [showExistingImage, setShowExistingImage] = useState(true);
  const [imageService] = useState(() => new ImageService());

  // 既存画像を取得（新規作成時は除く）
  useEffect(() => {
    const loadExistingImage = async () => {
      if (!menu.id) {
        // 新規作成時は画像を取得しない
        setExistingImageUrl(null);
        return;
      }

      try {
        const url = await imageService.getMenuImageUrlById(menu.id);
        setExistingImageUrl(url);
      } catch (error) {
        console.error("既存画像の取得に失敗しました:", error);
      }
    };

    loadExistingImage();
  }, [menu.id, imageService]);

  const categoryOptions: Option[] = [
    { value: "1", label: "主菜" },
    { value: "4", label: "丼物" },
    { value: "5", label: "カレー" },
    { value: "11", label: "麺類" },
  ];

  const getCategoryOption = (category_code: number) => {
    return categoryOptions.find(
      (category) => category.value === category_code.toString()
    );
  };

  const onChange = (data: Partial<OriginalMenu>) => {
    setEditMenu((prev) => ({ ...prev, ...data }));
  };

  const onPriceChange = (value: string, size: "small" | "medium" | "large") => {
    const numValue = parseInt(value) || 0;
    const updatedPrice = {
      ...editMenu.price,
      [size]: numValue,
    };
    onChange({ price: updatedPrice });
  };

  const onSizeChange = (size: "large" | "small", checked: boolean) => {
    // チェックボックスの状態を更新
    setSizeEnabled((prev) => ({
      ...prev,
      [size]: checked,
    }));

    if (checked) {
      // チェックが入った場合、デフォルト価格を設定
      const defaultPrice =
        editMenu.price.medium > 0 ? editMenu.price.medium : 100;
      const updatedPrice = {
        ...editMenu.price,
        [size]: editMenu.price[size] || defaultPrice,
      };
      onChange({
        price: updatedPrice,
      });
    } else {
      // チェックが外れた場合、価格情報を削除
      const updatedPrice = { ...editMenu.price };
      delete updatedPrice[size];
      onChange({
        price: updatedPrice,
      });
    }
  };

  const onCategoryChange = (newValue: unknown) => {
    try {
      const option = newValue as Option;
      const num = Number(option.value);
      const updatedPrice = { ...editMenu.price };

      if (num == 4 || num == 5) {
        // 丼物・カレー：大・小サイズあり
        updatedPrice.large = updatedPrice.large || editMenu.price.medium;
        updatedPrice.small = updatedPrice.small || editMenu.price.medium;
        setSizeEnabled({
          large: true,
          small: true,
        });
      } else if (num == 11) {
        // 麺類：大サイズあり、小サイズなし
        updatedPrice.large = updatedPrice.large || editMenu.price.medium;
        delete updatedPrice.small;
        setSizeEnabled({
          large: true,
          small: false,
        });
      } else if (num == 1) {
        // 主菜：大・小サイズなし
        delete updatedPrice.large;
        delete updatedPrice.small;
        setSizeEnabled({
          large: false,
          small: false,
        });
      }

      onChange({ category: num, price: updatedPrice });
    } catch {
      // エラーハンドリング
    }
  };

  const handleSave = async () => {
    if (
      editMenu.title &&
      editMenu.price.medium > 0 &&
      editMenu.category &&
      onSave
    ) {
      try {
        // 新規作成の場合（IDが空文字）
        if (!editMenu.id) {
          // 画像ファイルがある場合は、メニュー保存後に画像を保存
          if (imageFile) {
            // メニューを保存してIDを取得するためのコールバック付きでonSaveを呼び出し
            await onSave(editMenu, imageFile);
          } else {
            // 画像がない場合は通常の保存
            onSave(editMenu);
          }
        } else {
          // 既存メニューの編集の場合
          // 既存画像を削除する場合（UIで非表示にされている場合）
          if (existingImageUrl && !showExistingImage && !imageFile) {
            await imageService.deleteMenuImage(editMenu.id);
          }

          // 新しい画像がある場合はアップロード
          if (imageFile) {
            await imageService.uploadMenuImage(editMenu.id, imageFile);
          }

          onSave(editMenu);
        }
      } catch (error) {
        console.error("画像の処理に失敗しました:", error);
        // エラーが発生してもメニューの保存は続行
        onSave(editMenu);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm("このメニューを削除しますか？")) {
      try {
        // 画像も削除
        await imageService.deleteMenuImage(editMenu.id);
        onDelete(editMenu.id);
      } catch (error) {
        console.error("画像の削除に失敗しました:", error);
        // エラーが発生してもメニューの削除は続行
        onDelete(editMenu.id);
      }
    }
  };

  const customSelectStyles: StylesConfig = {
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
      fontSize: "0.875rem",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      caretColor: "transparent",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "8px 0",
    }),
    option: (provided) => ({
      ...provided,
      paddingTop: "4px",
      paddingBottom: "4px",
    }),
  };

  return (
    <div className="pt-5 pb-5 pr-4">
      {/* 右上のバツボタン */}
      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="hover:text-[#990000]"
          title="キャンセル"
        >
          <MdClose size={16} />
        </button>
      </div>
      <div className="pb-2">
        <label className="text-[14px] text-[#990000] font-medium pb-1">
          メニュー表示名
        </label>
        <div className="flex flex-row gap-4">
          <input
            type="text"
            className="w-[70%] py-1.5 px-2 text-sm rounded border border-[#CCCCCC] focus:border-blue-500 focus:outline-none"
            value={editMenu.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="メニュー名を入力"
          />
          <div className="flex-1">
            <Select
              options={categoryOptions}
              value={getCategoryOption(editMenu.category)}
              className="text-sm w-full border-[#CCCCCC]"
              styles={customSelectStyles}
              onChange={onCategoryChange}
              placeholder="カテゴリを選択"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-5 pb-2">
        <PriceInput
          label="価格"
          value={editMenu.price.medium}
          onChange={(value) => onPriceChange(value, "medium")}
          required={true}
        />
        <div className="flex items-center gap-1 pt-8">
          <Checkbox
            id="large"
            checked={sizeEnabled.large}
            onCheckedChange={(checked) => onSizeChange("large", !!checked)}
            disabled={editMenu.category == 1}
          />
          <label htmlFor="large" className="text-xs text-gray-700">
            大サイズ
          </label>
        </div>

        <div className="flex items-center gap-1 pt-8">
          <Checkbox
            id="small"
            checked={sizeEnabled.small}
            onCheckedChange={(checked) => onSizeChange("small", !!checked)}
            disabled={editMenu.category == 11 || editMenu.category == 1}
          />
          <label htmlFor="small" className="text-xs text-gray-700">
            小サイズ
          </label>
        </div>
      </div>

      <div className="flex flex-row gap-5">
        {sizeEnabled.large && (
          <PriceInput
            label="価格（大）"
            value={editMenu.price.large || 0}
            onChange={(value) => onPriceChange(value, "large")}
          />
        )}

        {sizeEnabled.small && (
          <PriceInput
            label="価格（小）"
            value={editMenu.price.small || 0}
            onChange={(value) => onPriceChange(value, "small")}
          />
        )}
      </div>

      {/* 画像アップロード */}
      <div className="pt-4">
        <ImageUpload
          value={imageFile}
          onChange={setImageFile}
          existingImageUrl={showExistingImage ? existingImageUrl : null}
          onRemoveExistingImage={() => {
            setShowExistingImage(false);
          }}
        />
      </div>

      {/* 下部のボタン */}
      <div className="flex gap-2 pt-4 justify-center">
        {onDelete && (
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="bg-white text-[#990000] border border-[#D87C7C] hover:bg-[#D87C7C]"
          >
            削除
          </Button>
        )}
        <Button
          onClick={handleSave}
          variant="default"
          disabled={
            !editMenu.title || editMenu.price.medium <= 0 || !editMenu.category
          }
          className="bg-[#0089F0] hover:bg-[#0060A8]"
        >
          メニュー登録
        </Button>
      </div>
    </div>
  );
};
