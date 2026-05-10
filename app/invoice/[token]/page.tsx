'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface MonthlyInvoice {
  type: 'monthly';
  invoiceNumber: string;
  issuedAt: string;
  driverName: string;
  period: string;
  total: number;
  to: string;
  count: number;
  rate: number;
  subtotal: number;
  tax: number;
}

interface ManualInvoice {
  type: 'manual';
  invoiceNumber: string;
  issuedAt: string;
  driverName: string;
  date: string;
  amount: number;
  company: string;
}

type InvoiceResponse = MonthlyInvoice | ManualInvoice;

export default function InvoiceViewPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<InvoiceResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoice-data?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('請求書が見つかりませんでした'))
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
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>請求書が見つかりません</p>
          <p style={{ color: '#999', fontSize: '14px' }}>リンクが無効か、期限切れの可能性があります。</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const issueDate = data.issuedAt.split(' ')[0] || `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;

  // 支払期限: 翌月末
  const dueDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2, 0);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  })();

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
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>TYD 請求書プレビュー</span>
        <button
          onClick={() => window.print()}
          style={{
            background: '#C8102E', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '10px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
          }}>
          PDF保存 / 印刷
        </button>
      </div>

      {/* 請求書本体 */}
      <div style={{
        maxWidth: '794px', margin: '20px auto', background: '#fff',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)', padding: '60px 50px',
        minHeight: '1000px',
      }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', margin: 0, letterSpacing: '8px' }}>請 求 書</h1>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>INVOICE</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' }}>{data.invoiceNumber}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>発行日: {issueDate}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>支払期限: {dueDate}</p>
          </div>
        </div>

        {/* 宛先・発行者 */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', color: '#999', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '2px' }}>請求先</p>
            <div style={{ borderBottom: '2px solid #111', paddingBottom: '8px' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>
                {data.type === 'monthly' ? data.to.replace('（月次請求）', '') : data.company}
              </p>
              <span style={{ fontSize: '14px', color: '#333' }}> 御中</span>
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#999', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '2px' }}>発行者</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: '0 0 2px' }}>{data.driverName}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>個人事業主</p>
          </div>
        </div>

        {/* 合計額 */}
        <div style={{
          background: '#f8f9fa', borderRadius: '8px', padding: '20px 24px',
          marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderLeft: '4px solid #C8102E',
        }}>
          <span style={{ fontSize: '14px', color: '#666' }}>ご請求金額（税込）</span>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', fontVariantNumeric: 'tabular-nums' }}>
            ¥{(data.type === 'monthly' ? data.total : data.amount).toLocaleString()}
          </span>
        </div>

        {/* 明細テーブル */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '11px', color: '#999', fontWeight: 'bold' }}>品目</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: '#999', fontWeight: 'bold' }}>数量</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: '#999', fontWeight: 'bold' }}>単価</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '11px', color: '#999', fontWeight: 'bold' }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {data.type === 'monthly' ? (
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333' }}>配送業務報酬（{data.period}）</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{data.count.toLocaleString()} 件</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{data.rate.toLocaleString()}</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#111', textAlign: 'right', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>¥{data.subtotal.toLocaleString()}</td>
              </tr>
            ) : (
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333' }}>業務報酬</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333', textAlign: 'right' }}>1</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#333', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{data.amount.toLocaleString()}</td>
                <td style={{ padding: '14px 8px', fontSize: '14px', color: '#111', textAlign: 'right', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>¥{data.amount.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 小計・税・合計 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            {data.type === 'monthly' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
                  <span>小計</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{data.subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
                  <span>消費税（10%）</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{data.tax.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111', borderTop: '2px solid #111', marginTop: '4px' }}>
                  <span>合計</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{data.total.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
                  <span>小計</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{data.amount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#555' }}>
                  <span>消費税（10%）</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{Math.floor(data.amount * 0.1).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#111', borderTop: '2px solid #111', marginTop: '4px' }}>
                  <span>合計</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{Math.floor(data.amount * 1.1).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 備考 */}
        <div style={{ marginTop: '40px', padding: '16px', background: '#f8f9fa', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>備考</p>
          {data.type === 'monthly' && (
            <>
              <p style={{ margin: '2px 0' }}>対象期間: {data.period}</p>
              <p style={{ margin: '2px 0' }}>配送件数: {data.count.toLocaleString()}件</p>
              <p style={{ margin: '2px 0' }}>報酬単価: ¥{data.rate}/件</p>
            </>
          )}
          <p style={{ margin: '2px 0' }}>お振込先: ○○銀行 ○○支店 普通 XXXXXXX</p>
        </div>

        {/* フッター */}
        <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '10px', color: '#bbb' }}>
          <p>この請求書はTYDロジスティクス管理システムにより発行されました</p>
        </div>
      </div>
    </>
  );
}
