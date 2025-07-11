"use client";

import { FC, useMemo, useState } from "react";
import { OriginalMenu } from "../src/types/Menu";
import { useOriginalMenuPresenter } from "../src/presenters/OriginalMenuPresenter";
import { OriginalMenuService } from "../src/services/OriginalMenuService";
import { FirebaseMenuRepository } from "../src/repositories/firebase/FirebaseMenuRepository";
import { VscEdit } from "react-icons/vsc";
import { OriginalMenuEditForm } from "./OriginalMenuEditForm";
import { OriginalMenuCRUDService } from "../src/services/OriginalMenuCRUDService";
import { ImageService } from "../src/services/ImageService";

type OriginalMenuListProps = {
  className?: string;
};

export const OriginalMenuList: FC<OriginalMenuListProps> = ({
  className = "",
}) => {
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const menuRepository = useMemo(() => new FirebaseMenuRepository(), []);
  const originalMenuService = useMemo(
    () => new OriginalMenuService(menuRepository),
    [menuRepository]
  );
  const crudService = useMemo(() => new OriginalMenuCRUDService(), []);
  const { getAllMenus, loading, error, refresh } =
    useOriginalMenuPresenter(originalMenuService);

  // 新規作成時の初期メニューオブジェクト
  const createNewMenu = (): OriginalMenu => ({
    id: "", // 新規作成時は空文字、保存時にFirestoreで自動生成
    title: "",
    price: {
      medium: 0,
    },
    image: "",
    category: 1, // デフォルトは主菜
  });

  const handleSave = async (updatedMenu: OriginalMenu, imageFile?: File) => {
    try {
      const savedMenu = await crudService.saveOriginalMenu(updatedMenu);
      
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
      await crudService.deleteOriginalMenu(menuId);
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
