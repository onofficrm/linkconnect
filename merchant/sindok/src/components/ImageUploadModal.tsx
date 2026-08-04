import React, { useState } from "react";
import { saveCustomImage, removeCustomImage, getCustomImages } from "../utils/storage";
import { Upload, X, Image as ImageIcon, Trash2, CheckCircle, Link as LinkIcon } from "lucide-react";

interface ImageUploadModalProps {
  isOpen: boolean;
  targetKey: string; // e.g. 'logo-placeholder' or 'work-photo-01'
  title: string;
  onClose: () => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  targetKey,
  title,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(getCustomImages()[targetKey] || null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      saveCustomImage(targetKey, result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setPreview(imageUrl.trim());
    saveCustomImage(targetKey, imageUrl.trim());
    setImageUrl("");
  };

  const handleRemove = () => {
    removeCustomImage(targetKey);
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
              <span className="font-mono text-xs text-blue-600 font-bold">
                키값: {targetKey}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Image Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">현재 등록된 상태</label>
          <div className="aspect-16/9 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative">
            {preview ? (
              <img src={preview} alt="미리보기" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-4 space-y-1">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-mono text-sm font-bold text-slate-600">{targetKey}</div>
                <p className="text-[11px] text-slate-400">등록된 이미지가 없습니다 (기본 플레이스홀더 표시 중)</p>
              </div>
            )}
          </div>

          {preview && (
            <button
              onClick={handleRemove}
              className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg flex items-center justify-center gap-1 border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>등록 이미지 삭제 (플레이스홀더 상태로 복원)</span>
            </button>
          )}
        </div>

        {/* File Drag & Drop Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`p-6 border-2 border-dashed rounded-xl text-center space-y-2 transition-colors cursor-pointer ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e: any) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            };
            input.click();
          }}
        >
          <Upload className="w-6 h-6 text-blue-600 mx-auto" />
          <div className="text-xs font-bold text-slate-800">
            내 컴퓨터에서 사진 파일 직접 선택 / 드래그
          </div>
          <p className="text-[10px] text-slate-400">JPG, PNG, WEBP 지원</p>
        </div>

        {/* Or Image Web URL Input */}
        <form onSubmit={handleUrlSubmit} className="space-y-2 pt-2 border-t">
          <label className="block text-xs font-bold text-slate-700">이미지 Web URL로 등록</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 shrink-0"
            >
              적용
            </button>
          </div>
        </form>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            완료 / 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
