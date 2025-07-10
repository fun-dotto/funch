"use client";

import { FC, useMemo } from "react";
import { OriginalMenu } from "../src/types/Menu";
import { useOriginalMenuPresenter } from "../src/presenters/OriginalMenuPresenter";
import { OriginalMenuService } from "../src/services/OriginalMenuService";
import { FirebaseMenuRepository } from "../src/repositories/firebase/FirebaseMenuRepository";
import { VscEdit } from "react-icons/vsc";

type OriginalMenuListProps = {
  className?: string;
};

export const OriginalMenuList: FC<OriginalMenuListProps> = ({
  className = "",
}) => {
  const menuRepository = useMemo(() => new FirebaseMenuRepository(), []);
  const originalMenuService = useMemo(
    () => new OriginalMenuService(menuRepository),
    [menuRepository]
  );
  const { getAllMenus, loading, error } =
    useOriginalMenuPresenter(originalMenuService);

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
              <OriginalMenuListItem key={menu.id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type OriginalMenuListItemProps = {
  menu: OriginalMenu;
};

const OriginalMenuListItem: FC<OriginalMenuListItemProps> = ({ menu }) => {
  const handleEdit = () => {
    console.log("Edit menu:", menu);
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{menu.title}</h4>
      </div>
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={handleEdit}
          className="hover:text-[#990000] transition-colors"
        >
          <VscEdit size={16} />
        </button>
      </div>
    </div>
  );
};
