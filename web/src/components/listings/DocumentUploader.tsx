'use client';

import { useRef, useState, type DragEvent } from 'react';
import {
  uploadListingDocument,
  deleteListingDocument,
  formatSize,
  isValidDocumentType,
} from '@/lib/uploadDocument';
import type { ListingDocument } from '@/types';

const MAX_FILES = 3;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

export function DocumentUploader({
  advertiserId,
  documents,
  onChange,
}: {
  advertiserId: string;
  documents: ListingDocument[];
  onChange: (docs: ListingDocument[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
  const remainingFiles = MAX_FILES - documents.length;
  const remainingSize = MAX_TOTAL_SIZE - totalSize;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (remainingFiles <= 0) {
      setError(`資料は${MAX_FILES}つまでです。`);
      return;
    }

    const targets = Array.from(files).slice(0, remainingFiles);
    setError('');
    setUploading(true);

    try {
      const uploaded: ListingDocument[] = [];
      let addedSize = 0;

      for (const file of targets) {
        if (!isValidDocumentType(file.type)) {
          throw new Error(`${file.name}: PDF・PowerPoint・画像のみです。`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}: 1ファイル10MB以下にしてください。`);
        }
        if (addedSize + file.size > remainingSize) {
          throw new Error('資料の合計サイズは20MB以下にしてください。');
        }
        const doc = await uploadListingDocument(file, advertiserId);
        uploaded.push(doc);
        addedSize += file.size;
      }
      onChange([...documents, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードに失敗しました。');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (doc: ListingDocument) => {
    if (!window.confirm(`「${doc.name}」を削除しますか？`)) return;
    await deleteListingDocument(doc.path);
    onChange(documents.filter((d) => d.path !== doc.path));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>
          {documents.length} / {MAX_FILES} ファイル
        </span>
        <span>合計 {formatSize(totalSize)} / 20MB</span>
      </div>

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.path}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {doc.type === 'application/pdf' && '📄 '}
                  {doc.type.includes('presentation') && '📊 '}
                  {doc.type === 'application/vnd.ms-powerpoint' && '📊 '}
                  {doc.type.startsWith('image/') && '🖼 '}
                  {doc.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{formatSize(doc.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(doc)}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      {documents.length < MAX_FILES && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-xs transition ' +
            (dragOver
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 bg-gray-50 hover:border-emerald-400')
          }
        >
          {uploading ? (
            <p className="text-gray-500">アップロード中…</p>
          ) : (
            <>
              <p className="font-bold text-gray-700">＋ 資料を追加</p>
              <p className="mt-1 text-gray-500">PDF・PowerPoint・画像 / 1ファイル10MBまで</p>
              <p className="mt-0.5 text-gray-400">クリック or ドロップ</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        応募者が応募した際、応募者の登録メールに自動で添付送信されます。
      </p>
    </div>
  );
}
