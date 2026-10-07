'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ListingDetail } from './ListingDetail';
import { LISTING_STATUS_LABELS, type Listing } from '@/types';

export function PreviewModal({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-6xl rounded-2xl bg-gray-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-5 py-3">
          <div>
            <p className="text-sm font-bold">プレビュー</p>
            <p className="text-xs text-gray-500">
              {LISTING_STATUS_LABELS[listing.status]}
              {listing.status === 'draft' && '・「審査申請」で管理者に提出'}
              {listing.status === 'reviewing' && '・承認されるとサイトに公開されます'}
              {listing.status === 'published' && '・編集を保存すると再審査になります'}
            </p>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <ListingDetail listing={listing} preview />
        </div>
      </div>
    </div>
  );
}
