      <div className="space-y-3">
        {rows.map(({ inquiry, detail }) => {
          const statusLabel = INQUIRY_STATUS_LABELS[inquiry.status];
          const statusColor =
            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : inquiry.status === 'delivered' ? 'bg-emerald-100 text-emerald-800'
                : inquiry.status === 'won' ? 'bg-emerald-600 text-white'
                  : inquiry.status === 'lost' ? 'bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-600';

          const disclosed = inquiry.status !== 'pending';

          return (
            <div key={inquiry.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className={'rounded-full px-3 py-1 ' + statusColor}>
                  {statusLabel}
                </span>
                {inquiry.createdAt?.seconds && (
                  <span className="text-gray-500">
                    {new Date(inquiry.createdAt.seconds * 1000).toLocaleString('ja-JP')}
                  </span>
                )}
              </div>

              {disclosed && detail ? (
                <div className="space-y-3">
                  <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    <Row label="氏名" value={detail.fullName} />
                    <Row label="フリガナ" value={detail.kana} />
                    <Row label="電話" value={detail.phone} />
                    <Row label="メール" value={detail.email} />
                    <Row label="郵便番号" value={detail.postalCode} />
                    <Row label="都道府県" value={detail.prefecture} />
                    <Row label="市区町村" value={detail.city} />
                    <Row label="番地" value={detail.address} />
                    <Row label="建物" value={detail.building} />
                  </div>
                  {detail.message && (
                    <div>
                      <p className="mb-1 text-xs font-bold text-gray-500">応募動機</p>
                      <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                        {detail.message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  この応募はまだ開示されていません。デポジットが追加されると開示されます。
                </p>
              )}
            </div>
          );
        })}
      </div>
