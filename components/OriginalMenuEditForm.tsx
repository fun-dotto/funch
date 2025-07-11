"use client";

import { FC, useState } from "react";
import { OriginalMenu } from "../src/types/Menu";
import Select, { StylesConfig } from "react-select";
import { FaSave } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Checkbox } from "./ui/checkbox";
import { PriceInput } from "./PriceInput";
import { Button } from "./ui/button";

type Option = {
  value: string;
  label: string;
};

type OriginalMenuEditFormProps = {
  menu: OriginalMenu;
  onCancel: () => void;
  onSave?: (updatedMenu: OriginalMenu) => void;
  onDelete?: (menuId: string) => void;
};

export const OriginalMenuEditForm: FC<OriginalMenuEditFormProps> = ({
  menu,
  onCancel,
  onSave,
  onDelete,
}) => {
  const [editMenu, setEditMenu] = useState<OriginalMenu>(menu);

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
    if (checked) {
      // チェックが入った場合、デフォルト価格を設定
      const defaultPrice = 100;
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
      } else if (num == 11) {
        // 麺類：大サイズあり、小サイズなし
        updatedPrice.large = updatedPrice.large || editMenu.price.medium;
        delete updatedPrice.small;
      } else if (num == 1) {
        // 主菜：大・小サイズなし
        delete updatedPrice.large;
        delete updatedPrice.small;
      }

      onChange({ category: num, price: updatedPrice });
    } catch {
      // エラーハンドリング
    }
  };

  const handleSave = () => {
    if (
      editMenu.title &&
      editMenu.price.medium > 0 &&
      editMenu.category &&
      onSave
    ) {
      onSave(editMenu);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("このメニューを削除しますか？")) {
      onDelete(editMenu.id);
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
    <div className="bg-gray-50 p-4 border-b border-gray-200 relative">
      {/* 右上のバツボタン */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
        title="キャンセル"
      >
        <MdClose size={16} />
      </button>
      <div>
        <label className="block text-[14px] text-[#990000] font-medium">
          メニュー表示名
        </label>
        <div className="flex flex-row">
          <input
            type="text"
            className="w-[70%] py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
            value={editMenu.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="メニュー名を入力"
          />
          <div>
            <Select
              options={categoryOptions}
              value={getCategoryOption(editMenu.category)}
              className="text-sm"
              styles={customSelectStyles}
              onChange={onCategoryChange}
              placeholder="カテゴリを選択"
            />
          </div>
        </div>
      </div>

      <PriceInput
        label="価格（中サイズ）"
        value={editMenu.price.medium}
        onChange={(value) => onPriceChange(value, "medium")}
        placeholder="価格を入力"
        required={true}
      />

      <div className="col-span-2">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="large"
              checked={!!editMenu.price.large}
              onCheckedChange={(checked) => onSizeChange("large", !!checked)}
              disabled={editMenu.category == 1}
            />
            <label htmlFor="large" className="text-xs text-gray-700">
              大サイズ
            </label>
          </div>

          {!!editMenu.price.large && (
            <PriceInput
              label="価格（大サイズ）"
              value={editMenu.price.large || 0}
              onChange={(value) => onPriceChange(value, "large")}
              placeholder="大サイズの価格を入力"
            />
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="small"
              checked={!!editMenu.price.small}
              onCheckedChange={(checked) => onSizeChange("small", !!checked)}
              disabled={editMenu.category == 11 || editMenu.category == 1}
            />
            <label htmlFor="small" className="text-xs text-gray-700">
              小サイズ
            </label>
          </div>

          {!!editMenu.price.small && (
            <PriceInput
              label="価格（小サイズ）"
              value={editMenu.price.small || 0}
              onChange={(value) => onPriceChange(value, "small")}
              placeholder="小サイズの価格を入力"
            />
          )}
        </div>
      </div>

      {/* 下部のボタン */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={!onDelete}
        >
          削除
        </Button>
        <Button
          onClick={handleSave}
          variant="default"
          size="sm"
          disabled={!editMenu.title || editMenu.price.medium <= 0 || !editMenu.category}
        >
          保存
        </Button>
      </div>
    </div>
  );
};
