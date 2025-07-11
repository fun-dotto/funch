"use client";

import { FC, useState, useRef, DragEvent } from "react";
import { MdClose } from "react-icons/md";
import { CgImage } from "react-icons/cg";

type ImageUploadProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
};

export const ImageUpload: FC<ImageUploadProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // プレビューURL生成
  const generatePreviewUrl = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  // ファイル選択処理
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      generatePreviewUrl(file);
      onChange(file);
    }
  };

  // ファイル削除処理
  const handleFileRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(null);
  };

  // クリックでファイル選択
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // ファイル入力変更
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative w-full h-28 border rounded-lg cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-[#CCCCCC] bg-[#F8F8F8] hover:border-gray-400"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl || (value && previewUrl) ? (
          // 画像プレビュー表示
          <div className="flex items-center justify-center h-full">
            <div className="relative w-[40%] h-[90%] flex items-center justify-center">
              <img
                src={previewUrl || ""}
                alt="プレビュー"
                className="object-cover rounded-lg w-full h-full"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileRemove();
                }}
                className="absolute top-1 right-1 bg-[#990000] text-white rounded-full p-1 hover:bg-[#650000] transition-colors"
              >
                <MdClose size={12} />
              </button>
            </div>
          </div>
        ) : (
          // 画像未選択時の表示
          <div className="flex flex-col h-full items-center justify-center text-[#3C373C]">
            <CgImage size={60} style={{ opacity: 0.3 }} />
            <p className="text-[14px] font-medium">画像をアップロード</p>
          </div>
        )}
      </div>
    </div>
  );
};
