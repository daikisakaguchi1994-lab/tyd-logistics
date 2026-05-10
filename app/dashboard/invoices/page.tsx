'use client';

import { useState, useMemo } from 'react';
import { PLAYERS, WEEKLY_DATA } from '@/src/mockData';
import { PARTNERS } from '@/src/mockDriverInfo';
import { useRates } from '@/components/RateContext';
import { formatDate } from '@/lib/utils';
import type { InvoiceData, InvoiceItem } from '@/src/types';
import { InvoicePreview } from './InvoicePreview';

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

export default function InvoicesPage() {
  const { clientRate, driverRates } = useRates();
  const [tab, setTab] = useState<InvoiceTab>('create');
  const [direction, setDirection] = useState<InvoiceDirection>('to-partner');
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS[0]?.id || '');
  const [selectedDriver, setSelectedDriver] = useState(PLAYERS[0]?.name || '');
  const [preview, setPreview] = useState<InvoiceData | null>(null);

  // デフォルト: 今月1日〜今日
  const today = new Date();
  const defaultStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultEnd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [periodStart, setPeriodStart] = useState(defaultStart);
  const [periodEnd, setPeriodEnd] = useState(defaultEnd);

  // 対象期間の表示ラベル
  const periodLabel = (() => {
    const s = new Date(periodStart);
    const e = new Date(periodEnd);
    return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 〜 ${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`;
  })();

  // 対象期間に含まれる週のデータを取得
  const getWeeksInPeriod = () => {
    // WEEKLY_DATAの週を期間でフィルタ（簡易: 全週を含める方式 → 将来はSheets実データから日単位集計）
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    const diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksCount = Math.max(1, Math.ceil(diffDays / 7));
    return WEEKLY_DATA.slice(-weeksCount);
  };

  // 対象ドライバー or パートナーに基づく請求書データ生成
  const generateInvoice = (): InvoiceData => {
    const now = new Date();
    const issueDate = formatDate(now);
    const due = new Date(now);
    due.setMonth(due.getMonth() + 1);
    due.setDate(0); // 翌月末
    const dueDate = formatDate(due);

    const recentWeeks = getWeeksInPeriod();

    if (direction === 'to-partner') {
      // パートナーへの請求（全ドライバー分の配送実績）
      const partner = PARTNERS.find(p => p.id === selectedPartner)!;
      const items: InvoiceItem[] = PLAYERS.map(p => {
        const qty = recentWeeks.reduce((s, w) => s + (w[p.name] as number), 0);
        const rate = partner.billingRate;
        return {
          description: `配送業務（${p.name}）`,
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
        notes: `対象期間: ${periodLabel}`,
      };
    } else {
      // ドライバーへの支払明細
      const driver = PLAYERS.find(p => p.name === selectedDriver)!;
      const rate = driverRates[driver.name] ?? 160;
      const qty = recentWeeks.reduce((s, w) => s + (w[driver.name] as number), 0);
      const items: InvoiceItem[] = [{
        description: `配送業務報酬`,
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
        notes: `対象期間: ${periodLabel}\n報酬単価: ¥${rate}/件`,
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
        <h1 className="text-lg font-bold text-primary">請求書管理</h1>
        <p className="text-xs mt-1 text-muted">請求書・支払明細の作成とプレビュー</p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 p-1 bg-surface rounded-md w-fit">
        {([['create', '新規作成'], ['history', '発行履歴']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="text-xs px-4 py-2 cursor-pointer font-medium transition-colors border-0 rounded-sm"
            style={{
              background: tab === key ? 'var(--brand-crimson)' : 'transparent',
              color: tab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                  className="text-sm px-4 py-2.5 cursor-pointer transition-colors rounded-md"
                  style={{
                    background: direction === key ? 'var(--brand-crimson-soft)' : 'var(--bg-elevated)',
                    color: direction === key ? 'var(--brand-crimson)' : 'var(--text-secondary)',
                    border: `1px solid ${direction === key ? 'var(--brand-crimson)' : 'var(--border-default)'}`,
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
                className="w-full max-w-md text-sm py-2.5 px-3 cursor-pointer bg-elevated text-primary border border-border-default rounded-md outline-none">
                {PARTNERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}（¥{p.billingRate}/件）</option>
                ))}
              </select>
            ) : (
              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
                className="w-full max-w-md text-sm py-2.5 px-3 cursor-pointer bg-elevated text-primary border border-border-default rounded-md outline-none">
                {PLAYERS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}（{p.character}/ ¥{driverRates[p.name] ?? 160}/件）</option>
                ))}
              </select>
            )}
          </div>

          {/* 期間 */}
          <div>
            <label className="label block mb-2">対象期間</label>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                className="text-sm py-2.5 px-3 bg-elevated text-primary border border-border-default rounded-md outline-none"
                style={{ colorScheme: 'dark' }} />
              <span className="text-xs text-muted">〜</span>
              <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
                className="text-sm py-2.5 px-3 bg-elevated text-primary border border-border-default rounded-md outline-none"
                style={{ colorScheme: 'dark' }} />
            </div>
            <p className="text-xs mt-1.5 text-muted">{periodLabel}</p>
          </div>

          {/* プレビューサマリー */}
          <div className="p-4 bg-elevated rounded-md">
            <h3 className="text-xs font-semibold mb-3 text-secondary">概算</h3>
            {direction === 'to-partner' ? (() => {
              const partner = PARTNERS.find(p => p.id === selectedPartner)!;
              const recentWeeks = getWeeksInPeriod();
              const total = PLAYERS.reduce((s, p) => s + recentWeeks.reduce((ws, w) => ws + (w[p.name] as number), 0), 0);
              const subtotal = total * partner.billingRate;
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">総配送件数</span>
                    <span className="num font-semibold text-primary">{total.toLocaleString()}件</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">小計</span>
                    <span className="num text-primary">¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-t-border-subtle">
                    <span className="text-primary">合計（税込）</span>
                    <span className="num text-positive">¥{Math.floor(subtotal * 1.1).toLocaleString()}</span>
                  </div>
                </div>
              );
            })() : (() => {
              const rate = driverRates[selectedDriver] ?? 160;
              const recentWeeks = getWeeksInPeriod();
              const qty = recentWeeks.reduce((s, w) => s + (w[selectedDriver] as number), 0);
              const subtotal = qty * rate;
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">配送件数</span>
                    <span className="num font-semibold text-primary">{qty.toLocaleString()}件</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">単価</span>
                    <span className="num text-primary">¥{rate}/件</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-t-border-subtle">
                    <span className="text-primary">合計（税込）</span>
                    <span className="num text-positive">¥{Math.floor(subtotal * 1.1).toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <button onClick={() => setPreview(generateInvoice())}
            className="text-sm px-6 py-3 font-semibold cursor-pointer bg-crimson text-primary border-0 rounded-md">
            請求書をプレビュー
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-b-border-default">
                  {['請求番号', '発行日', '宛先', '金額', 'ステータス'].map(h => (
                    <th key={h} className="text-left text-xs py-3 px-4 text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockHistory.map(inv => (
                  <tr key={inv.number} className="transition-colors border-b border-b-border-subtle">
                    <td className="text-sm py-3 px-4 num font-medium text-primary">{inv.number}</td>
                    <td className="text-sm py-3 px-4 num text-secondary">{inv.date}</td>
                    <td className="text-sm py-3 px-4 text-primary">{inv.to}</td>
                    <td className="text-sm py-3 px-4 num font-semibold text-primary">¥{inv.amount.toLocaleString()}</td>
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
