'use client';

import { WEEKLY_DATA, PLAYERS } from '@/src/mockData';

interface HighlightCardsProps {
  totalDeliveries: number;
  currentWeekTotal: number;
  overallChange: number;
  mvp: { name: string; currentWeek: number; change: number };
  needsAttention: { name: string; change: number }[];
  weeklyRevenue: number;
  weeklyProfit: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  profitMargin?: number;
}

function Sparkline({ data, color, width = 120, height = 28 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return { x, y };
  });
  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${lineD} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;
  const gradId = `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={width} height={height} role="img" aria-label="推移">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatYen(n: number): string {
  if (n >= 10000) return `¥${(n / 10000).toFixed(1)}万`;
  return `¥${n.toLocaleString()}`;
}

export function HighlightCards({ currentWeekTotal, overallChange, mvp, totalDeliveries, needsAttention, weeklyRevenue, weeklyProfit, monthlyRevenue, monthlyProfit, profitMargin }: HighlightCardsProps) {
  const weeklyTotals = WEEKLY_DATA.map(w =>
    PLAYERS.reduce((sum, p) => sum + (w[p.name] as number), 0)
  );
  const mvpData = WEEKLY_DATA.map(w => w[mvp.name] as number);

  return (
    <div className="space-y-4">
      {/* 上段: 配送 + 売上 + 粗利 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 配送件数 */}
        <div className="card card-bar card-bar-crimson p-5">
          <p className="label mb-2">今週の配送件数</p>
          <div className="flex items-baseline gap-2">
            <span className="num text-4xl font-bold text-primary">{currentWeekTotal}</span>
            <span className="text-base text-muted">件</span>
            <span className={`num text-xs font-semibold ml-auto px-2 py-0.5 rounded-sm ${overallChange >= 0 ? 'bg-positive-soft text-positive' : 'bg-negative-soft text-negative'}`}>
              {overallChange >= 0 ? '+' : ''}{overallChange}%
            </span>
          </div>
          <div className="mt-2"><Sparkline data={weeklyTotals} color="#C8102E" /></div>
          <div className="flex gap-4 mt-2 pt-2 border-t border-t-border-subtle">
            <span className="text-xs text-muted">月計 <span className="num font-semibold text-primary">{totalDeliveries}</span></span>
            <span className="text-xs text-muted">稼働 <span className="num font-semibold text-primary">{PLAYERS.length}名</span></span>
          </div>
        </div>

        {/* 売上 */}
        <div className="card card-bar card-bar-gold p-5">
          <p className="label mb-2">今週の売上</p>
          <div className="flex items-baseline gap-1">
            <span className="num text-3xl font-bold text-primary">{formatYen(weeklyRevenue)}</span>
          </div>
          <div className="mt-3 pt-2 border-t border-t-border-subtle">
            <span className="text-xs text-muted">月間売上 </span>
            <span className="num text-sm font-bold text-gold">{formatYen(monthlyRevenue)}</span>
          </div>
        </div>

        {/* 粗利 */}
        <div className="card p-5" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
          <p className="label mb-2">今週の粗利</p>
          <div className="flex items-baseline gap-1">
            <span className="num text-3xl font-bold text-positive">{formatYen(weeklyProfit)}</span>
          </div>
          <div className="mt-3 pt-2 border-t border-t-border-subtle">
            <span className="text-xs text-muted">月間粗利 </span>
            <span className="num text-sm font-bold text-positive">{formatYen(monthlyProfit)}</span>
            <span className="text-xs ml-2 text-disabled">利益率 {profitMargin ?? 11.1}%</span>
          </div>
        </div>
      </div>

      {/* 下段: MVP + 要フォロー */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card card-bar card-bar-gold p-4">
          <p className="label mb-2">今週のMVP</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center text-base font-bold rounded-md bg-gold-soft border border-gold text-gold">
              {mvp.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-primary">{mvp.name}</p>
              <span className="num text-xs text-secondary">{mvp.currentWeek}件</span>
              <span className="num text-xs font-semibold ml-2 text-positive">+{mvp.change}%</span>
            </div>
            <Sparkline data={mvpData} color="#D4A437" width={56} height={24} />
          </div>
        </div>

        <div className="card p-4" style={{ borderColor: needsAttention.length > 0 ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)' }}>
          <p className="label mb-2">要フォロー</p>
          {needsAttention.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-negative-soft">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4m0 4h.01M3 17h14L10 3 3 17z" stroke="var(--negative)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{needsAttention[0].name}</p>
                <p className="text-xs text-negative">前週比 <span className="num font-semibold">{needsAttention[0].change}%</span></p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-positive-soft">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10l3 3 5-6" stroke="var(--positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-base font-semibold text-positive">全員好調</p>
                <p className="text-xs text-muted">フォロー対象なし</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
