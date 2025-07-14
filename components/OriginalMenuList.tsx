"use client";

import { FC, useState } from "react";
import { OriginalMenu } from "../src/types/Menu";
import { useOriginalMenuPresenter } from "../src/presenters/OriginalMenuPresenter";
import { VscEdit } from "react-icons/vsc";
import { OriginalMenuEditForm } from "./OriginalMenuEditForm";
import { ImageService } from "../src/services/ImageService";

type OriginalMenuListProps = {
  className?: string;
};

export const OriginalMenuList: FC<OriginalMenuListProps> = ({
  className = "",
}) => {
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { getAllMenus, loading, error, refresh } =
    useOriginalMenuPresenter();

  // 新規作成時の初期メニューオブジェクト
  const createNewMenu = (): OriginalMenu => ({
    id: "", // 新規作成時は空文字、保存時にFirestoreで自動生成
    title: "",
    price: {
      medium: 0,
    },
    category: 1, // デフォルトは主菜
  });

  const handleSave = async (updatedMenu: OriginalMenu, imageFile?: File) => {
    try {
      const isNewMenu = !updatedMenu.id || updatedMenu.id === "";
      
      // API経由で保存
      const apiData = {
        name: updatedMenu.title,
        category_id: updatedMenu.category,
        prices: updatedMenu.price,
      };

      let response;
      if (isNewMenu) {
        // 新規作成
        response = await fetch("/api/original_menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
      } else {
        // 更新
        response = await fetch(`/api/original_menu/${updatedMenu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      const result = await response.json();
      const savedMenu = result.data;

      // 新規作成で画像がある場合は、生成されたIDを使って画像を保存
      if (imageFile && savedMenu && savedMenu.id) {
        const imageService = new ImageService();
        await imageService.uploadMenuImage(savedMenu.id, imageFile);
      }

      setEditingMenuId(null);
      setIsCreating(false);
      refresh();
    } catch (error) {
      console.error("保存に失敗しました:", error);
    }
  };

  const handleCreateNew = () => {
    setEditingMenuId(null);
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleDelete = async (menuId: string) => {
    try {
      const response = await fetch(`/api/original_menu/${menuId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      setEditingMenuId(null);
      refresh();
    } catch (error) {
      console.error("削除に失敗しました:", error);
    }
  };

  if (loading) {
    return (
      <div className={`${className} bg-white`}>
        <div className="p-4 text-center">オリジナルメニューを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-white`}>
        <div className="text-center text-red-500">エラー: {error}</div>
      </div>
    );
  }

  const allMenus = getAllMenus().sort((a, b) =>
    a.title.localeCompare(b.title, "ja", { sensitivity: "base" })
  );

  return (
    <div
      className={`${className} bg-white overflow-x-hidden overflow-y-scroll`}
    >
      <div>
        {allMenus.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            オリジナルメニューがありません
          </div>
        ) : (
          <div className="space-y-0">
            {allMenus.map((menu) => (
              <OriginalMenuListItem
                key={menu.id}
                menu={menu}
                isEditing={editingMenuId === menu.id}
                onEdit={() => setEditingMenuId(menu.id)}
                onCancelEdit={() => setEditingMenuId(null)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}

            {/* 新規作成フォーム */}
            {isCreating && (
              <div className="border-t border-gray-200 pt-2">
                <OriginalMenuEditForm
                  menu={createNewMenu()}
                  onCancel={handleCancelCreate}
                  onSave={handleSave}
                  onDelete={undefined}
                />
              </div>
            )}

            {/* 追加ボタン */}
            {!isCreating && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0089F0] text-white rounded-lg hover:bg-[#0060A8] transition-colors"
                >
                  <span>メニューの追加</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

type OriginalMenuListItemProps = {
  menu: OriginalMenu;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (menu: OriginalMenu) => void;
  onDelete: (menuId: string) => void;
};

const OriginalMenuListItem: FC<OriginalMenuListItemProps> = ({
  menu,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center py-3 border-b border-gray-200">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{menu.title}</h4>
        </div>
        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={onEdit}
            className="hover:text-[#990000] transition-colors"
          >
            <VscEdit size={16} />
          </button>
        </div>
      </div>
      {isEditing && (
        <OriginalMenuEditForm
          menu={menu}
          onCancel={onCancelEdit}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
