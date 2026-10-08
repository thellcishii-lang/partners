'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { PreviewModal } from '@/components/listings/PreviewModal';
import { LISTING_STATUS_LABELS, type Listing } from '@/types';

type Tab = 'new' | 'edit' | 'all';

export default function AdminListingsPage() {
  const [tab, setTab] = useState<Tab>('new');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string>('');
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  const load = useCallback(async (target: Tab) => {
    setLoading(true);
    setError('');
    setListings([]);
    try {
      const q = target === 'new'
        ? query(collection(db, 'listings'), where('status', '==', 'reviewing'))
        : target === 'edit'
          ? query(
              collection(db, 'listings'),
              where('status', '==', 'published'),
              where('pendingEditSubmitted', '==', true),
            )
          : query(
              collection(db, 'listings'),
              where('status', 'in', ['draft', 'reviewing', 'published', 'paused']),
            );
      const snap = await getDocs(q);
      const items = snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as Listing))
        .sort((a, b) => {
          const at = (a.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          const bt = (b.updatedAt as { seconds?: number } | null)?.seconds ?? 0;
          return bt - at;
        });
      setListings(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const call = async (
    fnName:
      | 'approveListing' | 'rejectListing'
      | 'approvePendingEdit' | 'rejectPendingEdit'
      | 'forcePauseListing' | 'forceCloseListing',
    listingId: string,
    payload: Record<string, unknown> = {},
    removeFromList = true,
  ) => {
    setBusy(listingId);
    setError('');
    try {
      const callable = httpsCallable<Record<string, unknown>, { listingId: string }>(
        functions,
        fnName
      );
      await callable({ listingId, ...payload });
      if (removeFromList) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
      } else {
        await load(tab);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました。');
    } finally {
      setBusy('');
    }
  };

  const approve = (id: string) => {
    const fn = tab === 'new' ? 'approveListing' : 'approvePendingEdit';
    call(fn, id);
  };

  const reject = (id: string) => {
    const reason = window.prompt('却下理由（任意・募集者にメールで通知されます）') ?? '';
    if (!window.confirm(tab === 'new'
      ? 'この案件を却下して下書きに戻しますか？'
      : 'この編集を却下して破棄しますか？（公開中の内容は変わりません）')) return;
    const fn = tab === 'new' ? 'rejectListing' : 'rejectPendingEdit';
    call(fn, id, { reason });
  };

  const forcePause = (id: string) => {
    const reason = window.prompt('非公開にする理由（任意）') ?? '';
    if (!window.confirm('この案件を強制的に非公開にしますか？')) return;
    call('forcePauseListing', id, { reason }, false);
  };

  const forceClose = (id: string) => {
    const reason = window.prompt('募集終了の理由（任意）') ?? '';
    if (!window.confirm('この案件を募集終了にしますか？この操作は募集者側から戻せません。')) return;
    call('forceCloseListing', id, { reason }, false);
  };

  const previewMerged: Listing | null = useMemo(() => {
    if (!previewListing) return null;
    if (tab === 'edit' && previewListing.pendingEdit?.data) {
      return {
        ...previewListing,
        ...previewListing.pendingEdit.data,
        pendingEdit: null,
      } as Listing;
    }
    return previewListing;
  }, [previewListing, tab]);

  if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b">
        {([
          ['new', '新規審査'],
          ['edit', '編集審査'],
          ['all', 'すべて'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px ' +
              (tab === key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700')
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">
          {tab === 'new' ? '新規審査待ち' : tab === 'edit' ? '編集審査待ち' : 'すべて'}
          {' '}
          {listings.length}件
        </h2>
        <button
          type="button"
          onClick={() => load(tab)}
          className="text-sm text-brand-700 underline hover:no-underline"
        >
          再読み込み
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {listings.length === 0 && (
        <p className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          {tab === 'new' ? '審査待ちの案件はありません。'
            : tab === 'edit' ? '編集審査待ちの案件はありません。'
              : '稼働中の案件はありません。'}
        </p>
      )}

      <div className="space-y-3">
        {listings.map((l) => {
          const editNote = l.pendingEdit?.note;
          const editSubmittedAt = l.pendingEdit?.submittedAt;

          return (
            <div key={l.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{l.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{l.companyName || '会社名未設定'}</p>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {LISTING_STATUS_LABELS[l.status]}
                    </span>
                    <span>📍 {l.areaLabels?.length ? l.areaLabels.slice(0, 2).join('・') : '未設定'}</span>
                    {l.productLabels?.length ? <span>🏷 {l.productLabels.join(', ')}</span> : null}
                    {l.initialCostLabel ? <span>💵 {l.initialCostLabel}</span> : null}
                  </div>

                  {tab === 'edit' && editNote && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                      <p className="font-bold">変更内容</p>
                      <p className="mt-1 whitespace-pre-wrap">{editNote}</p>
                    </div>
                  )}
                  {tab === 'edit' && editSubmittedAt && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      提出日時: {new Date((editSubmittedAt as { seconds: number }).seconds * 1000).toLocaleString('ja-JP')}
                    </p>
                  )}
                  {tab === 'all' && l.reviewNote && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                      <p className="font-bold">メモ</p>
                      <p className="mt-1 whitespace-pre-wrap">{l.reviewNote}</p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === l.id}
                    onClick={() => setPreviewListing(l)}
                  >
                    プレビュー
                  </Button>

                  {(tab === 'new' || tab === 'edit') && (
                    <>
                      <Button
                        size="sm"
                        disabled={busy === l.id}
                        onClick={() => approve(l.id)}
                      >
                        {tab === 'new' ? '承認して公開' : '編集を承認'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === l.id}
                        onClick={() => reject(l.id)}
                      >
                        却下
                      </Button>
                    </>
                  )}

                  {tab === 'all' && (
                    <>
                      {l.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === l.id}
                          onClick={() => forcePause(l.id)}
                        >
                          強制非公開
                        </Button>
                      )}
                      {l.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy === l.id}
                          onClick={() => forceClose(l.id)}
                        >
                          募集終了
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {previewMerged && (
        <PreviewModal
          listing={previewMerged}
          onClose={() => setPreviewListing(null)}
        />
      )}
    </div>
  );
}
