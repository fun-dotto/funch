"use client";

import { FC, useState, useEffect } from "react";
import { OriginalMenu } from "../src/types/Menu";
import { PriceModel } from "../src/types/Price";
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
  const [priceList] = useState<PriceModel[]>([]); // TODO: 実際の価格リストを取得

  const categoryOptions: Option[] = [
    { value: "1", label: "主菜" },
    { value: "4", label: "丼物" },
    { value: "5", label: "カレー" },
    { value: "11", label: "麺類" },
  ];

  const getLabelForPrice = (price: PriceModel) => {
    let l = price.medium + "円";
    if (price.large != undefined || price.small != undefined) {
      l = "中:" + l;
    }
    if (price.large != undefined) {
      l += " 大:" + price.large + "円";
    }
    if (price.small != undefined) {
      l += " 小:" + price.small + "円";
    }
    return l;
  };

  const getCategoryOption = (category_code: number) => {
    return categoryOptions.find(
      (category) => category.value === category_code.toString()
    );
  };

  const getPriceOptions = (category_code: number) => {
    const categoryPriceList = priceListOnCategory(category_code);
    if (categoryPriceList.length == 0) {
      return [];
    }
    return categoryPriceList.map((price) => {
      return { value: price.id, label: getLabelForPrice(price) };
    });
  };

  const priceListOnCategory = (category: number) => {
    return priceList.filter((price) => {
      return price.categories.includes(category);
    });
  };

  const getPriceOption = (priceId: string) => {
    const priceOptions = getPriceOptions(editMenu.category);
    return priceOptions.find((price) => price.value === priceId);
  };

  const onChange = (data: Partial<OriginalMenu>) => {
    setEditMenu((prev) => ({ ...prev, ...data }));
  };

  const onPriceChange = (newValue: unknown) => {
    try {
      const option = newValue as Option;
      const price = priceList.find((price) => price.id === option.value);
      if (price) {
        onChange({ price });
      }
    } catch {
      // エラーハンドリング
    }
  };

  const onCategoryChange = (newValue: unknown) => {
    try {
      const option = newValue as Option;
      const num = Number(option.value);
      if (num == 4 || num == 5) {
        onChange({ category: num, large: true, small: true });
      } else if (num == 11) {
        onChange({ category: num, large: true, small: false });
      } else if (num == 1) {
        onChange({ category: num, large: false, small: false });
      } else {
        onChange({ category: num });
      }
    } catch {
      // エラーハンドリング
    }
  };

  const handleSave = () => {
    if (editMenu.title && editMenu.price && editMenu.category && onSave) {
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
              価格
            </label>
            <Select
              options={getPriceOptions(editMenu.category)}
              value={getPriceOption(editMenu.price.id)}
              className="text-sm"
              styles={customSelectStyles}
              onChange={onPriceChange}
              placeholder="価格を選択"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="large"
                checked={editMenu.large}
                onChange={(e) => onChange({ large: e.target.checked })}
                disabled={editMenu.category == 1}
                className="mr-2"
              />
              <label htmlFor="large" className="text-xs text-gray-700">
                大サイズ
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="small"
                checked={editMenu.small}
                onChange={(e) => onChange({ small: e.target.checked })}
                disabled={editMenu.category == 11 || editMenu.category == 1}
                className="mr-2"
              />
              <label htmlFor="small" className="text-xs text-gray-700">
                小サイズ
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};