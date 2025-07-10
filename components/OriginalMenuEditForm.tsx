"use client";

import { FC, useState } from "react";
import { OriginalMenu } from "../src/types/Menu";
import Select, { StylesConfig } from "react-select";
import { FaSave } from "react-icons/fa";
import { MdClose } from "react-icons/md";

type Option = {
  value: string;
  label: string;
};

type OriginalMenuEditFormProps = {
  menu: OriginalMenu;
  onCancel: () => void;
  onSave?: (updatedMenu: OriginalMenu) => void;
};

export const OriginalMenuEditForm: FC<OriginalMenuEditFormProps> = ({
  menu,
  onCancel,
  onSave,
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

  const onPriceChange = (value: string, size: 'small' | 'medium' | 'large') => {
    const numValue = parseInt(value) || 0;
    const updatedPrice = {
      ...editMenu.price,
      [size]: numValue
    };
    onChange({ price: updatedPrice });
  };

  const onSizeChange = (size: 'large' | 'small', checked: boolean) => {
    if (checked) {
      // チェックが入った場合、デフォルト価格を設定
      const updatedPrice = {
        ...editMenu.price,
        [size]: editMenu.price[size] || editMenu.price.medium
      };
      onChange({ 
        price: updatedPrice
      });
    } else {
      // チェックが外れた場合、価格情報を削除
      const updatedPrice = { ...editMenu.price };
      delete updatedPrice[size];
      onChange({ 
        price: updatedPrice
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
    if (editMenu.title && editMenu.price.medium > 0 && editMenu.category && onSave) {
      onSave(editMenu);
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
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            メニュー編集
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-800"
              title="保存"
            >
              <FaSave size={16} />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="キャンセル"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              メニュー名
            </label>
            <input
              type="text"
              className="w-full py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
              value={editMenu.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="メニュー名を入力"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <Select
              options={categoryOptions}
              value={getCategoryOption(editMenu.category)}
              className="text-sm"
              styles={customSelectStyles}
              onChange={onCategoryChange}
              placeholder="カテゴリを選択"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              価格（中サイズ）
            </label>
            <div className="flex items-center">
              <input
                type="number"
                className="w-full py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                value={editMenu.price.medium}
                onChange={(e) => onPriceChange(e.target.value, 'medium')}
                placeholder="価格を入力"
                min="0"
              />
              <span className="ml-2 text-sm text-gray-500">円</span>
            </div>
          </div>

          <div className="col-span-2">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="large"
                  checked={!!editMenu.price.large}
                  onChange={(e) => onSizeChange('large', e.target.checked)}
                  disabled={editMenu.category == 1}
                  className="mr-2"
                />
                <label htmlFor="large" className="text-xs text-gray-700">
                  大サイズ
                </label>
              </div>
              
              {editMenu.price.large && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    価格（大サイズ）
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="w-full py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                      value={editMenu.price.large || ''}
                      onChange={(e) => onPriceChange(e.target.value, 'large')}
                      placeholder="大サイズの価格を入力"
                      min="0"
                    />
                    <span className="ml-2 text-sm text-gray-500">円</span>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="small"
                  checked={!!editMenu.price.small}
                  onChange={(e) => onSizeChange('small', e.target.checked)}
                  disabled={editMenu.category == 11 || editMenu.category == 1}
                  className="mr-2"
                />
                <label htmlFor="small" className="text-xs text-gray-700">
                  小サイズ
                </label>
              </div>
              
              {editMenu.price.small && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    価格（小サイズ）
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="w-full py-1.5 px-2 text-sm rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                      value={editMenu.price.small || ''}
                      onChange={(e) => onPriceChange(e.target.value, 'small')}
                      placeholder="小サイズの価格を入力"
                      min="0"
                    />
                    <span className="ml-2 text-sm text-gray-500">円</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};