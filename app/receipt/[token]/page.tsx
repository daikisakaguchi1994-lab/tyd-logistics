'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ReceiptData {
  receiptNumber: string;
  issuedAt: string;
  driverName: string;
  date: string;
  amount: number;
  company: string;
}

export default function ReceiptViewPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/receipt-data?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('領収書が見つかりませんでした'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <p style={{ color: '#666' }}>読み込み中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>領収書が見つかりません</p>
          <p style={{ color: '#999', fontSize: '14px' }}>リンクが無効か、期限切れの可能性があります。</p>
        </div>
      </div>
    );
  }

  const issueDate = data.issuedAt.split(' ')[0] || data.date;
  const tax = Math.floor(data.amount * 0.1);
  const total = data.amount + tax;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          @page { margin: 15mm; size: A4; }
        }
        body { margin: 0; padding: 0; font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif; }
      `}</style>

      {/* 印刷/PDF保存ボタン */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#1a1a2e', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>TYD 領収書プレビュー</span>
        <button
          onClick={() => window.print()}
          style={{
            background: '#C8102E', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
          }}>
          PDF保存 / 印刷
        </button>
      </div>

      {/* 領収書本体 */}
      <div style={{
        maxWidth: '794px', margin: '20px auto', background: '#fff',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)', padding: '60px 50px',
        minHeight: '700px',
      }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', margin: 0, letterSpacing: '8px' }}>領 収 書</h1>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>RECEIPT</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' }}>{data.receiptNumber}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>発行日: {issueDate}</p>
          </div>
        </div>

        {/* 宛先・発行者 */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', color: '#999', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '2px' }}>宛先</p>
            <div style={{ borderBottom: '2px solid #111', paddingBottom: '8px' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>
                {data.company || '（未指定）'}
              </p>
              <span style={{ fontSize: '14px', color: '#333' }}> 様</span>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#999', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '2px' }}>発行者</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 2px' }}>{data.driverName}</p>
          </div>
        </div>

        {/* 金額 */}
        <div style={{
          background: '#f8f9fa', borderRadius: '8px', padding: '24px',
          marginBottom: '30px', textAlign: 'center',
          borderLeft: '4px solid #C8102E',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>下記の金額を正に領収いたしました</p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#111', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
            ¥{total.toLocaleString()}-
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>（税込）</p>
        </div>

        {/* 内訳 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
              <span>税抜金額</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{data.amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
              <span>消費税（10%）</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{tax.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111', borderTop: '2px solid #111', marginTop: '4px' }}>
              <span>合計</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 但し書き */}
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px', fontSize: '13px', color: '#555' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>但し</span>
            <span>配送業務報酬として</span>
          </div>
        </div>

        {/* 収入印紙欄 */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: '160px', height: '100px',
            border: '1px dashed #ccc', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', color: '#ccc',
          }}>
            収入印紙
          </div>
        </div>

        {/* フッター */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#bbb' }}>
          <p>この領収書はTYDロジスティクス管理システムにより発行されました</p>
        </div>
      </div>
    </>
  );
}
