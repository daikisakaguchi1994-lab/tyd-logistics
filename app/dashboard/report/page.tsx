'use client';

import { useState } from 'react';
import { useRates } from '@/components/RateContext';
import { PLAYERS, WEEKLY_DATA } from '@/src/mockData';
import { formatYen } from '@/lib/utils';
import { Signal } from '@/components/ui';

type ReportType = 'weekly' | 'monthly';

// Stripe/Square 風 KPI ゲージ
function ProfitGauge({ rate }: { rate: number }) {
  const clampedRate = Math.max(0, Math.min(rate, 30));
  const pct = (clampedRate / 30) * 100;
  const color = rate >= 12 ? '#10B981' : rate >= 8 ? '#F59E0B' : '#EF4444';
  return (
    <div className="mt-2">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>0%</span>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>30%</span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const { clientRate, driverRates, getMargin } = useRates();

  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
  const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const weekLabel = currentWeek.week;

  // === 週次データ ===
  const weeklyDriverData = PLAYERS.map(p => {
    const current = currentWeek[p.name] as number;
    const prev = prevWeek[p.name] as number;
    const change = Math.round(((current - prev) / prev) * 100);
    const rate = driverRates[p.name] ?? 160;
    const revenue = current * clientRate;
    const labor = current * rate;
    const profit = current * getMargin(p.name);
    const dailyAvg = Math.round(current / 6);
    return { name: p.name, character: p.character, current, prev, change, rate, revenue, labor, profit, dailyAvg };
  }).sort((a, b) => b.current - a.current);

  // === 月次データ（直近4週） ===
  const last4Weeks = WEEKLY_DATA.slice(-4);
  const prev4Weeks = WEEKLY_DATA.slice(-8, -4);
  const monthlyDriverData = PLAYERS.map(p => {
    const current4 = last4Weeks.reduce((s, w) => s + (w[p.name] as number), 0);
    const prev4 = prev4Weeks.reduce((s, w) => s + (w[p.name] as number), 0);
    const change = prev4 > 0 ? Math.round(((current4 - prev4) / prev4) * 100) : 0;
    const rate = driverRates[p.name] ?? 160;
    const revenue = current4 * clientRate;
    const labor = current4 * rate;
    const profit = current4 * getMargin(p.name);
    const dailyAvg = Math.round(current4 / 24);
    return { name: p.name, character: p.character, current: current4, prev: prev4, change, rate, revenue, labor, profit, dailyAvg };
  }).sort((a, b) => b.current - a.current);

  const isWeekly = reportType === 'weekly';
  const drivers = isWeekly ? weeklyDriverData : monthlyDriverData;

  const totals = drivers.reduce((acc, d) => ({
    current: acc.current + d.current,
    prev: acc.prev + d.prev,
    revenue: acc.revenue + d.revenue,
    labor: acc.labor + d.labor,
    profit: acc.profit + d.profit,
  }), { current: 0, prev: 0, revenue: 0, labor: 0, profit: 0 });
  const totalChange = totals.prev > 0 ? Math.round(((totals.current - totals.prev) / totals.prev) * 100) : 0;
  const profitRate = totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 1000) / 10 : 0;
  const avgMarginPerUnit = PLAYERS.reduce((s, p) => s + getMargin(p.name), 0) / PLAYERS.length;
  const laborCostRatio = totals.revenue > 0 ? Math.round((totals.labor / totals.revenue) * 1000) / 10 : 0;

  const top3 = drivers.slice(0, 3);
  const bottom3 = [...drivers].sort((a, b) => a.change - b.change).slice(0, 3);

  // 週次推移（直近8週）
  const recentWeeks = WEEKLY_DATA.slice(-8);
  const weeklyTrend = recentWeeks.map(w => {
    const total = PLAYERS.reduce((s, p) => s + (w[p.name] as number), 0);
    const revenue = total * clientRate;
    const labor = PLAYERS.reduce((s, p) => s + (w[p.name] as number) * (driverRates[p.name] ?? 160), 0);
    return { week: w.week, total, revenue, profit: revenue - labor };
  });

  // AI経営コメント — Uber/Stripe風の簡潔な分析
  const generateInsights = (): string[] => {
    const insights: string[] = [];
    if (totalChange >= 5) insights.push(`配送量は前期比+${totalChange}%で好調に推移。成長トレンドを維持。`);
    else if (totalChange >= 0) insights.push(`配送量は前期比+${totalChange}%で横ばい。安定稼働を継続。`);
    else insights.push(`配送量が前期比${totalChange}%で減少傾向。案件獲得の強化を検討。`);

    if (profitRate >= 12) insights.push(`粗利率${profitRate}%は健全水準。現行単価体系を維持。`);
    else if (profitRate >= 8) insights.push(`粗利率${profitRate}%はやや低下。単価交渉の余地あり。`);
    else insights.push(`粗利率${profitRate}%は低水準。単価・人件費の緊急見直しを推奨。`);

    const declining = drivers.filter(d => d.change <= -5);
    if (declining.length >= 3) {
      insights.push(`${declining.length}名が前期比マイナス（${declining.map(d => d.name).join('・')}）。個別面談を推奨。`);
    }

    const growing = drivers.filter(d => d.change >= 5);
    if (growing.length > 0) {
      insights.push(`${growing.map(d => d.name).join('・')}が好調（+${growing.map(d => d.change).join('/+')}%）。継続評価の検討を。`);
    }

    return insights;
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {/* コントロール */}
      <div className="flex items-center justify-between flex-wrap gap-3 print-hide">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>経営レポート</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>経営数値レポートの生成・PDF保存</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: '2px' }}>
            {(['weekly', 'monthly'] as const).map(t => (
              <button key={t} onClick={() => setReportType(t)}
                className="text-xs px-3 py-1.5 cursor-pointer transition-colors"
                style={{
                  borderRadius: 'var(--r-sm)', border: 'none',
                  background: reportType === t ? 'var(--brand-crimson)' : 'transparent',
                  color: reportType === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: reportType === t ? 600 : 400,
                }}>
                {t === 'weekly' ? '週次' : '月次'}
              </button>
            ))}
          </div>
          <button onClick={handlePrint}
            className="text-xs px-4 py-2 font-semibold cursor-pointer flex items-center gap-2"
            style={{ background: 'var(--brand-crimson)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', border: 'none', minHeight: '40px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PDF保存
          </button>
        </div>
      </div>

      {/* ===== レポート本体 ===== */}
      <div className="print-report space-y-5">
        {/* Stripe風 ヘッダーバー */}
        <div className="card p-6" style={{ borderImage: 'linear-gradient(90deg, var(--brand-crimson), var(--brand-gold), var(--brand-crimson)) 1', borderTopWidth: '3px', borderTopStyle: 'solid' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--brand-crimson)', borderRadius: 'var(--r-sm)', color: 'white' }}>T</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>TYD Logistics</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{isWeekly ? '週次' : '月次'}経営報告書</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                対象: {isWeekly ? `${weekLabel}週` : `${last4Weeks[0].week}〜${last4Weeks[last4Weeks.length - 1].week}`}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>作成日: {dateStr}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>稼働: <span className="num font-bold" style={{ color: 'var(--text-primary)' }}>{PLAYERS.length}名</span></p>
            </div>
          </div>
        </div>

        {/* KPIグリッド — Datadog/Stripe風 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: '配送件数', value: totals.current.toLocaleString(), unit: '件', signal: totalChange, color: 'var(--text-primary)' },
            { label: '売上高', value: formatYen(totals.revenue), signal: null, color: 'var(--text-primary)' },
            { label: '人件費', value: formatYen(totals.labor), signal: null, color: 'var(--brand-crimson)' },
            { label: '粗利', value: formatYen(totals.profit), signal: null, color: totals.profit >= 0 ? 'var(--positive)' : 'var(--negative)' },
            { label: '粗利率', value: `${profitRate}%`, signal: null, color: 'var(--brand-gold)', gauge: profitRate },
            { label: '人件費率', value: `${laborCostRatio}%`, signal: null, color: laborCostRatio <= 90 ? 'var(--text-primary)' : 'var(--negative)' },
          ].map(kpi => (
            <div key={kpi.label} className="card p-4">
              <p className="text-[10px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              <p className="num text-xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}{kpi.unit ? <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.unit}</span> : null}
              </p>
              {kpi.signal !== null && <div className="mt-1"><Signal value={kpi.signal} /></div>}
              {kpi.gauge !== undefined && <ProfitGauge rate={kpi.gauge} />}
            </div>
          ))}
        </div>

        {/* AI Insights — McKinsey風 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full"
              style={{ background: 'var(--brand-gold-soft)', color: 'var(--brand-gold)' }}>AI</div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI 経営インサイト</h3>
          </div>
          <div className="space-y-2">
            {generateInsights().map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
                <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: i === 0 ? 'var(--brand-crimson)' : 'var(--brand-gold)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TOP3 / 要注意 — Bloomberg Terminal風 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#D4A437"/></svg>
              <h3 className="text-sm font-bold" style={{ color: 'var(--brand-gold)' }}>トップパフォーマー</h3>
            </div>
            {top3.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div className="flex items-center gap-2.5">
                  <span className="num text-sm font-bold w-5 text-center" style={{ color: i === 0 ? '#D4A437' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>{i + 1}</span>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                    <span className="text-xs ml-1.5" style={{ color: 'var(--text-disabled)' }}>日平均{d.dailyAvg}件</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.current.toLocaleString()}</span>
                  <Signal value={d.change} />
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 4v3m0 3h.01M2 12h10L7 2 2 12z" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h3 className="text-sm font-bold" style={{ color: 'var(--negative)' }}>要注意ドライバー</h3>
            </div>
            {bottom3.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                  <span className="text-xs ml-1.5" style={{ color: 'var(--text-disabled)' }}>{d.character}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-xs" style={{ color: 'var(--text-muted)' }}>{d.current.toLocaleString()}件</span>
                  <Signal value={d.change} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 詳細テーブル — Notion DB風 */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>ドライバー別 実績詳細</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                  {['#', '名前', 'タイプ', '件数', '日平均', '前期比', '売上', '報酬', '粗利', '単価'].map(h => (
                    <th key={h} className={`py-2.5 px-2 text-xs font-medium ${h === '#' || h === '名前' || h === 'タイプ' ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d, i) => (
                  <tr key={d.name} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)', background: i === 0 ? 'var(--brand-crimson-soft)' : 'transparent' }}>
                    <td className="py-2.5 px-2 num text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="py-2.5 px-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</td>
                    <td className="py-2.5 px-2 text-xs" style={{ color: 'var(--text-disabled)' }}>{d.character}</td>
                    <td className="text-right py-2.5 px-2 num font-semibold" style={{ color: 'var(--text-primary)' }}>{d.current.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 num text-xs" style={{ color: 'var(--text-muted)' }}>{d.dailyAvg}</td>
                    <td className="text-right py-2.5 px-2"><Signal value={d.change} /></td>
                    <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--text-secondary)' }}>{formatYen(d.revenue)}</td>
                    <td className="text-right py-2.5 px-2 num" style={{ color: 'var(--brand-crimson)' }}>{formatYen(d.labor)}</td>
                    <td className="text-right py-2.5 px-2 num font-semibold" style={{ color: d.profit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatYen(d.profit)}</td>
                    <td className="text-right py-2.5 px-2 num text-xs" style={{ color: 'var(--text-muted)' }}>¥{d.rate}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-default)' }}>
                  <td className="py-2.5 px-2" />
                  <td className="py-2.5 px-2 font-bold" style={{ color: 'var(--text-primary)' }}>合計</td>
                  <td className="py-2.5 px-2" />
                  <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--text-primary)' }}>{totals.current.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-2 num text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{Math.round(totals.current / PLAYERS.length / (isWeekly ? 6 : 24))}</td>
                  <td className="text-right py-2.5 px-2"><Signal value={totalChange} /></td>
                  <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--text-primary)' }}>{formatYen(totals.revenue)}</td>
                  <td className="text-right py-2.5 px-2 num font-bold" style={{ color: 'var(--brand-crimson)' }}>{formatYen(totals.labor)}</td>
                  <td className="text-right py-2.5 px-2 num font-bold" style={{ color: totals.profit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatYen(totals.profit)}</td>
                  <td className="text-right py-2.5 px-2 num text-xs" style={{ color: 'var(--text-muted)' }}>
                    平均 ¥{Math.round(PLAYERS.reduce((s, p) => s + (driverRates[p.name] ?? 160), 0) / PLAYERS.length)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 週次推移 — Stripe Dashboard風 */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>直近8週の推移</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                  {['週', '配送件数', '売上', '粗利', '利益率'].map(h => (
                    <th key={h} className={`py-2 px-2 text-xs font-medium ${h === '週' ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyTrend.map((w, i) => {
                  const rate = w.revenue > 0 ? Math.round((w.profit / w.revenue) * 1000) / 10 : 0;
                  const isLatest = i === weeklyTrend.length - 1;
                  return (
                    <tr key={w.week} style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isLatest ? 'var(--brand-crimson-soft)' : 'transparent',
                    }}>
                      <td className="py-2 px-2 text-xs" style={{ color: 'var(--text-secondary)', fontWeight: isLatest ? 600 : 400 }}>{w.week}週</td>
                      <td className="text-right py-2 px-2 num" style={{ color: 'var(--text-primary)' }}>{w.total.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 num" style={{ color: 'var(--text-secondary)' }}>{formatYen(w.revenue)}</td>
                      <td className="text-right py-2 px-2 num" style={{ color: w.profit >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{formatYen(w.profit)}</td>
                      <td className="text-right py-2 px-2 num text-xs" style={{ color: rate >= 10 ? 'var(--positive)' : 'var(--warning)' }}>{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1件あたり経営指標 */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>1件あたりの経営指標</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>請求単価</p>
              <p className="num text-lg font-bold" style={{ color: 'var(--text-primary)' }}>¥{clientRate}</p>
            </div>
            <div className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>平均報酬単価</p>
              <p className="num text-lg font-bold" style={{ color: 'var(--brand-crimson)' }}>
                ¥{Math.round(PLAYERS.reduce((s, p) => s + (driverRates[p.name] ?? 160), 0) / PLAYERS.length)}
              </p>
            </div>
            <div className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>件あたり粗利</p>
              <p className="num text-lg font-bold" style={{ color: 'var(--positive)' }}>¥{avgMarginPerUnit.toFixed(0)}</p>
            </div>
            <div className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>損益分岐（件/週）</p>
              <p className="num text-lg font-bold" style={{ color: 'var(--brand-gold)' }}>
                {avgMarginPerUnit > 0 ? Math.ceil(totals.labor / avgMarginPerUnit / PLAYERS.length).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>
            TYD Logistics — 経営報告書 | 作成日 {dateStr} | 社外秘
          </p>
        </div>
      </div>
    </div>
  );
}
