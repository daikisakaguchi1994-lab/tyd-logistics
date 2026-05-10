'use client';

import { useState, useMemo } from 'react';
import { PLAYERS, WEEKLY_DATA } from '@/src/mockData';
import { PARTNERS } from '@/src/mockDriverInfo';
import { useRates } from '@/components/RateContext';
import type { InvoiceData, InvoiceItem } from '@/src/types';

type InvoiceDirection = 'to-partner' | 'to-driver';
type InvoiceTab = 'create' | 'history';

function generateInvoiceNumber(direction: InvoiceDirection): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = direction === 'to-partner' ? 'INV' : 'PAY';
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `${prefix}-${y}${m}-${seq}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 簡易PDF生成（印刷ベース）
function InvoicePreview({ invoice, onClose }: { invoice: InvoiceData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-elevated)' }}>

        {/* 印刷用コンテンツ */}
        <div id="invoice-print" className="p-8" style={{ color: '#111', fontFamily: 'sans-serif' }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111' }}>請求書</h1>
              <p className="text-sm mt-1" style={{ color: '#666' }}>INVOICE</p>
            </div>
            <div className="text-right text-sm" style={{ color: '#333' }}>
              <p className="font-semibold">{invoice.invoiceNumber}</p>
              <p>発行日: {invoice.issueDate}</p>
              <p>支払期限: {invoice.dueDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>請求先</p>
              <p className="text-base font-bold" style={{ color: '#111' }}>{invoice.to.name}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.to.address}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#999' }}>発行者</p>
              <p className="text-base font-bold" style={{ color: '#111' }}>{invoice.from.name}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.from.address}</p>
              <p className="text-sm" style={{ color: '#555' }}>{invoice.from.phone}</p>
            </div>
          </div>

          {/* 合計 */}
          <div className="mb-6 p-4" style={{ background: '#f8f8f8', borderRadius: '8px' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#666' }}>ご請求金額（税込）</span>
              <span className="text-2xl font-bold num" style={{ color: '#111' }}>
                ¥{invoice.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 明細テーブル */}
          <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th className="text-left text-xs py-2 px-2" style={{ color: '#999' }}>品目</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>数量</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>単価</th>
                <th className="text-right text-xs py-2 px-2" style={{ color: '#999' }}>金額</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td className="text-sm py-2.5 px-2" style={{ color: '#333' }}>{item.description}</td>
                  <td className="text-sm py-2.5 px-2 text-right num" style={{ color: '#333' }}>{item.quantity.toLocaleString()}</td>
                  <td className="text-sm py-2.5 px-2 text-right num" style={{ color: '#333' }}>¥{item.unitPrice.toLocaleString()}</td>
                  <td className="text-sm py-2.5 px-2 text-right num font-semibold" style={{ color: '#111' }}>¥{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 小計・税・合計 */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-sm" style={{ color: '#555' }}>
                <span>小計</span>
                <span className="num">¥{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#555' }}>
                <span>消費税（10%）</span>
                <span className="num">¥{invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '2px solid #111', color: '#111' }}>
                <span>合計</span>
                <span className="num">¥{invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 p-3 text-xs" style={{ background: '#f8f8f8', borderRadius: '6px', color: '#666' }}>
              <p className="font-semibold mb-1">備考</p>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* アクションバー */}
        <div className="flex justify-end gap-3 px-8 py-4" style={{ borderTop: '1px solid #eee' }}>
          <button onClick={onClose} className="text-sm px-4 py-2 cursor-pointer"
            style={{ background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px' }}>
            閉じる
          </button>
          <button
            onClick={() => {
              const printContent = document.getElementById('invoice-print');
              if (!printContent) return;
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`
                <html><head><title>${invoice.invoiceNumber}</title>
                <style>
                  body { font-family: sans-serif; margin: 0; padding: 20px; color: #111; }
                  .num { font-variant-numeric: tabular-nums; }
                  table { width: 100%; border-collapse: collapse; }
                  th { text-align: left; }
                  @media print { @page { margin: 15mm; size: A4; } }
                </style>
                </head><body>${printContent.innerHTML}</body></html>
              `);
              w.document.close();
              w.print();
            }}
            className="text-sm px-4 py-2 font-semibold cursor-pointer"
            style={{ background: 'var(--brand-crimson)', color: '#fff', border: 'none', borderRadius: '6px' }}>
            印刷 / PDF保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const { clientRate, driverRates } = useRates();
  const [tab, setTab] = useState<InvoiceTab>('create');
  const [direction, setDirection] = useState<InvoiceDirection>('to-partner');
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS[0]?.id || '');
  const [selectedDriver, setSelectedDriver] = useState(PLAYERS[0]?.name || '');
  const [weeksCount, setWeeksCount] = useState(4); // 何週間分
  const [preview, setPreview] = useState<InvoiceData | null>(null);

  // 対象ドライバー or パートナーに基づく請求書データ生成
  const generateInvoice = (): InvoiceData => {
    const now = new Date();
    const issueDate = formatDate(now);
    const due = new Date(now);
    due.setMonth(due.getMonth() + 1);
    due.setDate(0); // 翌月末
    const dueDate = formatDate(due);

    const recentWeeks = WEEKLY_DATA.slice(-weeksCount);

    if (direction === 'to-partner') {
      // パートナーへの請求（全ドライバー分の配送実績）
      const partner = PARTNERS.find(p => p.id === selectedPartner)!;
      const items: InvoiceItem[] = PLAYERS.map(p => {
        const qty = recentWeeks.reduce((s, w) => s + (w[p.name] as number), 0);
        const rate = partner.billingRate;
        return {
          description: `配送業務（${p.name}）${weeksCount}週間分`,
          quantity: qty,
          unitPrice: rate,
          amount: qty * rate,
        };
      });

      const subtotal = items.reduce((s, i) => s + i.amount, 0);
      const tax = Math.floor(subtotal * 0.1);

      return {
        invoiceNumber: generateInvoiceNumber('to-partner'),
        issueDate,
        dueDate,
        from: { name: 'TYDロジスティクス', address: '福岡市博多区博多駅前1-1-1', phone: '092-000-0000' },
        to: { name: partner.name, address: partner.address },
        items,
        subtotal,
        tax,
        total: subtotal + tax,
        notes: `対象期間: ${recentWeeks[0].week} 〜 ${recentWeeks[recentWeeks.length - 1].week}`,
      };
    } else {
      // ドライバーへの支払明細
      const driver = PLAYERS.find(p => p.name === selectedDriver)!;
      const rate = driverRates[driver.name] ?? 160;
      const qty = recentWeeks.reduce((s, w) => s + (w[driver.name] as number), 0);
      const items: InvoiceItem[] = [{
        description: `配送業務報酬（${weeksCount}週間分）`,
        quantity: qty,
        unitPrice: rate,
        amount: qty * rate,
      }];

      const subtotal = items.reduce((s, i) => s + i.amount, 0);
      const tax = Math.floor(subtotal * 0.1);

      return {
        invoiceNumber: generateInvoiceNumber('to-driver'),
        issueDate,
        dueDate,
        from: { name: 'TYDロジスティクス', address: '福岡市博多区博多駅前1-1-1', phone: '092-000-0000' },
        to: { name: `${driver.name}（個人事業主）`, address: '' },
        items,
        subtotal,
        tax,
        total: subtotal + tax,
        notes: `対象期間: ${recentWeeks[0].week} 〜 ${recentWeeks[recentWeeks.length - 1].week}\n報酬単価: ¥${rate}/件`,
      };
    }
  };

  // 履歴（デモ用モックデータ）
  const mockHistory = useMemo(() => {
    const history = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      history.push({
        number: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
        date: formatDate(d),
        to: PARTNERS[i % PARTNERS.length].name,
        amount: Math.floor(Math.random() * 5000000 + 3000000),
        status: i === 0 ? '未払い' : '支払済',
      });
    }
    return history;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>請求書管理</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>請求書・支払明細の作成とプレビュー</p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 p-1" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', width: 'fit-content' }}>
        {([['create', '新規作成'], ['history', '発行履歴']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="text-xs px-4 py-2 cursor-pointer font-medium transition-colors"
            style={{
              background: tab === key ? 'var(--brand-crimson)' : 'transparent',
              color: tab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none', borderRadius: 'var(--r-sm)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="card p-5 space-y-5">
          {/* 方向選択 */}
          <div>
            <label className="label block mb-2">請求書タイプ</label>
            <div className="flex gap-2">
              {([['to-partner', '取引先への請求書'], ['to-driver', 'ドライバーへの支払明細']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setDirection(key)}
                  className="text-sm px-4 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: direction === key ? 'var(--brand-crimson-soft)' : 'var(--bg-elevated)',
                    color: direction === key ? 'var(--brand-crimson)' : 'var(--text-secondary)',
                    border: `1px solid ${direction === key ? 'var(--brand-crimson)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--r-md)',
                    fontWeight: direction === key ? 600 : 400,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 宛先 */}
          <div>
            <label className="label block mb-2">
              {direction === 'to-partner' ? '請求先' : '対象ドライバー'}
            </label>
            {direction === 'to-partner' ? (
              <select value={selectedPartner} onChange={e => setSelectedPartner(e.target.value)}
                className="w-full max-w-md text-sm py-2.5 px-3 cursor-pointer"
                style={{
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', outline: 'none',
                }}>
                {PARTNERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}（¥{p.billingRate}/件）</option>
                ))}
              </select>
            ) : (
              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
                className="w-full max-w-md text-sm py-2.5 px-3 cursor-pointer"
                style={{
                  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', outline: 'none',
                }}>
                {PLAYERS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}（{p.character}/ ¥{driverRates[p.name] ?? 160}/件）</option>
                ))}
              </select>
            )}
          </div>

          {/* 期間 */}
          <div>
            <label className="label block mb-2">対象期間</label>
            <select value={weeksCount} onChange={e => setWeeksCount(Number(e.target.value))}
              className="text-sm py-2.5 px-3 cursor-pointer"
              style={{
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', outline: 'none',
              }}>
              <option value={1}>直近1週間</option>
              <option value={2}>直近2週間</option>
              <option value={4}>直近4週間（1ヶ月）</option>
              <option value={8}>直近8週間（2ヶ月）</option>
            </select>
          </div>

          {/* プレビューサマリー */}
          <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>概算</h3>
            {direction === 'to-partner' ? (() => {
              const partner = PARTNERS.find(p => p.id === selectedPartner)!;
              const recentWeeks = WEEKLY_DATA.slice(-weeksCount);
              const total = PLAYERS.reduce((s, p) => s + recentWeeks.reduce((ws, w) => ws + (w[p.name] as number), 0), 0);
              const subtotal = total * partner.billingRate;
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>総配送件数</span>
                    <span className="num font-semibold" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}件</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>小計</span>
                    <span className="num" style={{ color: 'var(--text-primary)' }}>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>合計（税込）</span>
                    <span className="num" style={{ color: 'var(--positive)' }}>¥{Math.floor(subtotal * 1.1).toLocaleString()}</span>
                  </div>
                </div>
              );
            })() : (() => {
              const rate = driverRates[selectedDriver] ?? 160;
              const recentWeeks = WEEKLY_DATA.slice(-weeksCount);
              const qty = recentWeeks.reduce((s, w) => s + (w[selectedDriver] as number), 0);
              const subtotal = qty * rate;
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>配送件数</span>
                    <span className="num font-semibold" style={{ color: 'var(--text-primary)' }}>{qty.toLocaleString()}件</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>単価</span>
                    <span className="num" style={{ color: 'var(--text-primary)' }}>¥{rate}/件</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>合計（税込）</span>
                    <span className="num" style={{ color: 'var(--positive)' }}>¥{Math.floor(subtotal * 1.1).toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <button onClick={() => setPreview(generateInvoice())}
            className="text-sm px-6 py-3 font-semibold cursor-pointer"
            style={{ background: 'var(--brand-crimson)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--r-md)' }}>
            請求書をプレビュー
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['請求番号', '発行日', '宛先', '金額', 'ステータス'].map(h => (
                    <th key={h} className="text-left text-xs py-3 px-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockHistory.map(inv => (
                  <tr key={inv.number} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="text-sm py-3 px-4 num font-medium" style={{ color: 'var(--text-primary)' }}>{inv.number}</td>
                    <td className="text-sm py-3 px-4 num" style={{ color: 'var(--text-secondary)' }}>{inv.date}</td>
                    <td className="text-sm py-3 px-4" style={{ color: 'var(--text-primary)' }}>{inv.to}</td>
                    <td className="text-sm py-3 px-4 num font-semibold" style={{ color: 'var(--text-primary)' }}>¥{inv.amount.toLocaleString()}</td>
                    <td className="text-sm py-3 px-4">
                      <span className="text-xs px-2 py-1" style={{
                        background: inv.status === '支払済' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.15)',
                        color: inv.status === '支払済' ? 'var(--positive)' : '#EAB308',
                        borderRadius: '4px',
                      }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* プレビューモーダル */}
      {preview && <InvoicePreview invoice={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
