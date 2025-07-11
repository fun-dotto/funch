"use client";

import { FC, useMemo, useState } from "react";
import { OriginalMenu } from "../src/types/Menu";
import { useOriginalMenuPresenter } from "../src/presenters/OriginalMenuPresenter";
import { OriginalMenuService } from "../src/services/OriginalMenuService";
import { FirebaseMenuRepository } from "../src/repositories/firebase/FirebaseMenuRepository";
import { VscEdit } from "react-icons/vsc";
import { OriginalMenuEditForm } from "./OriginalMenuEditForm";
import { OriginalMenuCRUDService } from "../src/services/OriginalMenuCRUDService";

type OriginalMenuListProps = {
  className?: string;
};

export const OriginalMenuList: FC<OriginalMenuListProps> = ({
  className = "",
}) => {
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const menuRepository = useMemo(() => new FirebaseMenuRepository(), []);
  const originalMenuService = useMemo(
    () => new OriginalMenuService(menuRepository),
    [menuRepository]
  );
  const crudService = useMemo(() => new OriginalMenuCRUDService(), []);
  const { getAllMenus, loading, error } =
    useOriginalMenuPresenter(originalMenuService);

  const handleSave = async (updatedMenu: OriginalMenu) => {
    try {
      await crudService.saveOriginalMenu(updatedMenu);
      setEditingMenuId(null);
      // リストを再読み込みする必要があります（presenterに再読み込み機能を追加することを推奨）
      window.location.reload(); // 一時的な解決策
    } catch (error) {
      console.error('保存に失敗しました:', error);
    }
  };

  const handleDelete = async (menuId: string) => {
    try {
      await crudService.deleteOriginalMenu(menuId);
      setEditingMenuId(null);
      // リストを再読み込みする必要があります
      window.location.reload(); // 一時的な解決策
    } catch (error) {
      console.error('削除に失敗しました:', error);
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

  const allMenus = getAllMenus();

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
