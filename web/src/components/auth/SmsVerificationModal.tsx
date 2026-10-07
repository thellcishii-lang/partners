'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { SmsVerificationBlock } from './SmsVerificationBlock';

export function SmsVerificationModal({
  onSuccess,
  onClose,
  description,
}: {
  onSuccess: () => void;
  onClose: () => void;
  description?: string;
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
        className="relative my-8 w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <p className="text-sm font-bold">SMS再認証</p>
            <p className="text-xs text-gray-500">
              セキュリティ保護のため、資料の閲覧前に認証が必要です
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
        <div className="p-5">
          <SmsVerificationBlock
            description={description ?? 'SMS認証を完了すると資料が開きます。'}
            onVerified={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
