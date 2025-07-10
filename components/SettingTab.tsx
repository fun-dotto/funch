"use client";

import { useState } from "react";

const SettingTab = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["設定1", "設定2"];

  return (
    <div className="flex-1 h-full bg-white rounded-lg shadow-lg p-8">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === index
                ? "border-b-2 border-[#990000]"
                : "hover:bg-gray-200 border-b-1 border-[#E6E6E6]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">設定1の内容</h3>
            <p>
              ここに設定1の詳細内容が表示されます。あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
            </p>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">設定2の内容</h3>
            <p>ここに設定2の詳細内容が表示されます。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingTab;
