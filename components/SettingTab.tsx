"use client";

import { useState } from "react";
import { MenuList } from "./MenuList";
import { OriginalMenuList } from "./OriginalMenuList";

const SettingTab = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["メニューリスト", "オリジナルメニュー追加"];

  return (
    <div className="flex-1 h-full bg-white rounded-lg shadow-lg p-8 flex flex-col">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === index
                ? "border-b-2 border-[#990000] text-[#990000]"
                : "border-b-1 border-[#E6E6E6]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-hidden">
        {activeTab === 0 && (
          <div className="h-full">
            <MenuList className="w-full rounded h-full overflow-y-auto" />
          </div>
        )}
        {activeTab === 1 && (
          <div className="h-full">
            <OriginalMenuList className="w-full rounded h-full overflow-y-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingTab;
