'use client';

import { useRef, useState, type DragEvent } from 'react';
import { uploadListingImage, deleteListingImage } from '@/lib/uploadImage';

export function ImageUploader({
  advertiserId,
  images,
  onChange,
  maxImages = 6,
}: {
  advertiserId: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`画像は${maxImages}枚までです。`);
      return;
    }
    const targets = Array.from(files).slice(0, remaining);
    setError('');
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of targets) {
        const url = await uploadListingImage(file, advertiserId);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードに失敗しました。');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (url: string) => {
    if (!window.confirm('この画像を削除しますか？')) return;
    await deleteListingImage(url);
    onChange(images.filter((u) => u !== url));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-gray-500">
          {images.length} / {maxImages} 枚
        </p>
        <p className="text-xs text-gray-500">
          推奨：1600×900px 以上、横長。アップロード時に自動で圧縮されます。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url) => (
          <div
            key={url}
            className="relative overflow-hidden rounded-lg border border-gray-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="aspect-video w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 rounded bg-black bg-opacity-60 px-2 py-1 text-xs text-white hover:bg-opacity-80"
            >
              削除
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={
              'flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-xs ' +
              (dragOver
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 bg-gray-50 hover:border-emerald-400')
            }
          >
            {uploading ? (
              <p className="text-gray-500">アップロード中…</p>
            ) : (
              <>
                <p className="font-bold text-gray-700">＋ 画像を追加</p>
                <p className="mt-1 text-gray-500">クリック or ドロップ</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
