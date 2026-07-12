import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

export function SectionCard({
  title,
  description,
  hint,
  count,
  max,
  error,
  children,
}: {
  title: string;
  description?: string;
  hint?: string;
  count?: number;
  max?: number;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {typeof count === 'number' && typeof max === 'number' ? (
            <span className="text-xs font-semibold text-slate-500">
              {count} / {max}
            </span>
          ) : null}
        </div>
        {description ? <p className="text-sm text-slate-500 mt-1">{description}</p> : null}
        {hint ? <p className="text-xs text-slate-400 mt-2">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

export function StringListInput({
  items,
  max,
  placeholder,
  disabled,
  onChange,
}: {
  items: string[];
  max: number;
  placeholder: string;
  disabled?: boolean;
  onChange: (items: string[]) => void;
}) {
  const filled = items.filter((v) => v.trim()).length;

  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const add = () => {
    if (filled >= max) return;
    onChange([...items, '']);
  };

  const remove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [''] : next);
  };

  return (
    <div className="space-y-2">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => update(index, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-50"
          />
          {items.length > 1 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(index)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 disabled:opacity-50"
              aria-label="삭제"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        disabled={disabled || filled >= max}
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 disabled:opacity-50"
      >
        <Plus size={16} /> 항목 추가
      </button>
    </div>
  );
}

export function TagInput({
  tags,
  max,
  placeholder,
  disabled,
  onChange,
}: {
  tags: string[];
  max: number;
  placeholder: string;
  disabled?: boolean;
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const addTags = (raw: string) => {
    const parts = raw
      .split(/[,，]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    const seen = new Set(tags.map((t) => t.toLowerCase()));
    const next = [...tags];
    parts.forEach((part) => {
      const key = part.toLowerCase();
      if (seen.has(key) || next.length >= max) return;
      seen.add(key);
      next.push(part);
    });
    onChange(next);
    setInput('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const remove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-100 text-sm"
          >
            {tag}
            {!disabled ? (
              <button type="button" onClick={() => remove(index)} className="text-cyan-600 hover:text-cyan-900" aria-label="삭제">
                <X size={14} />
              </button>
            ) : null}
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        disabled={disabled || tags.length >= max}
        placeholder={tags.length >= max ? `최대 ${max}개까지 등록할 수 있습니다.` : placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (input.trim()) addTags(input);
        }}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-50"
      />
      <p className="text-xs text-slate-400">엔터 또는 쉼표로 키워드를 추가할 수 있습니다.</p>
    </div>
  );
}

export type PromoGuideImageItem = {
  id: number;
  imageTitle: string;
  downloadUrl: string;
  originalFilename: string;
};

export function ImageUploader({
  images,
  max,
  maxBytes,
  disabled,
  uploading,
  onUpload,
  onDelete,
  onSort,
  onTitleChange,
  onTitleBlur,
}: {
  images: PromoGuideImageItem[];
  max: number;
  maxBytes: number;
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (files: FileList | File[]) => void;
  onDelete: (id: number) => void;
  onSort: (ids: number[]) => void;
  onTitleChange: (id: number, title: string) => void;
  onTitleBlur: (id: number, title: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files?.length) {
      onUpload(e.dataTransfer.files);
    }
  };

  const onImageDragStart = (index: number) => setDragIndex(index);
  const onImageDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onSort(next.map((img) => img.id));
    setDragIndex(null);
  };

  const maxLabel = maxBytes >= 1024 * 1024
    ? `${(maxBytes / (1024 * 1024)).toFixed(1)}MB`
    : `${Math.round(maxBytes / 1024)}KB`;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-slate-50'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <p className="text-sm text-slate-600 mb-2">이미지를 드래그하거나 파일을 선택하세요.</p>
        <p className="text-xs text-slate-400 mb-4">JPG, PNG, WEBP · 파일당 최대 {maxLabel} · 최대 {max}개</p>
        <label className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 ${disabled || uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
          파일 선택
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            disabled={disabled || uploading || images.length >= max}
            onChange={(e) => {
              if (e.target.files?.length) onUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable={!disabled}
              onDragStart={() => onImageDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onImageDrop(index)}
              className="rounded-xl border border-slate-200 overflow-hidden bg-white"
            >
              <div className="relative aspect-video bg-slate-100">
                <img src={img.downloadUrl} alt={img.imageTitle || img.originalFilename} className="w-full h-full object-contain" />
                {!disabled ? (
                  <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 text-slate-500 cursor-grab">
                    <GripVertical size={16} />
                  </div>
                ) : null}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => onDelete(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-500 hover:bg-red-50"
                    aria-label="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
              <div className="p-3">
                <input
                  type="text"
                  value={img.imageTitle}
                  disabled={disabled}
                  placeholder="이미지 제목 (예: 메인 배너)"
                  onChange={(e) => onTitleChange(img.id, e.target.value)}
                  onBlur={(e) => onTitleBlur(img.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-50"
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
