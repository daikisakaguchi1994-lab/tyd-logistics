'use client';

import { useState } from 'react';
import { useMessage } from './MessageContext';
import { useRates } from './RateContext';

interface PlayerStat {
  name: string;
  character: string;
  userId: string;
  currentWeek: number;
  monthlyTotal: number;
  change: number;
  badge: string;
}

interface PlayerTableProps {
  stats: PlayerStat[];
}

const DEFAULT_SHOW = 5;

export function PlayerTable({ stats }: PlayerTableProps) {
  const { openSendMessage, openAnalysis } = useMessage();
  const { driverRates, clientRate } = useRates();
  const sorted = [...stats].sort((a, b) => b.currentWeek - a.currentWeek);
  const maxWeek = Math.max(...sorted.map(s => s.currentWeek));
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? sorted : sorted.slice(0, DEFAULT_SHOW);
  const hasMore = sorted.length > DEFAULT_SHOW;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>ドライバーランキング</h2>
        <span className="label" style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--r-sm)' }}>今週</span>
      </div>

      <div className="space-y-2">
        {displayed.map((p, i) => {
          const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
          const barOpacity = 1 - (i * 0.08);
          const rate = driverRates[p.name] ?? 160;
          const earnings = p.currentWeek * rate;

          return (
            <div key={p.name} className="flex items-center gap-3 p-3 transition-colors"
              style={{ borderRadius: 'var(--r-md)', background: i === 0 ? 'var(--brand-crimson-soft)' : 'transparent' }}>
              <div className={`rank-badge num ${rankClass}`}>{i + 1}</div>
              <div className="w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ borderRadius: 'var(--r-sm)', background: 'var(--brand-crimson-soft)', color: 'var(--brand-crimson)' }}>
                {p.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-disabled)' }}>{p.character}</span>
                  {p.badge && (
                    <span className="text-xs px-1.5 py-0.5 font-medium" style={{
                      borderRadius: 'var(--r-sm)',
                      background: p.badge === 'MVP' ? 'var(--brand-gold-soft)' : p.badge === '要フォロー' ? 'var(--negative-soft)' : 'var(--warning-soft)',
                      color: p.badge === 'MVP' ? 'var(--brand-gold)' : p.badge === '要フォロー' ? 'var(--negative)' : 'var(--warning)',
                    }}>{p.badge}</span>
                  )}
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(p.currentWeek / maxWeek) * 100}%`, opacity: barOpacity }} /></div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline gap-0.5">
                  <span className="num text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.currentWeek}</span>
                  <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>件</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="num text-xs" style={{ color: 'var(--brand-gold)' }}>¥{earnings.toLocaleString()}</span>
                  <span className="num text-xs font-semibold" style={{ color: p.change >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                    {p.change >= 0 ? '+' : ''}{p.change}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => openAnalysis({ driverName: p.name, userId: p.userId })}
                  className="text-xs px-2 py-1.5 font-medium transition-all cursor-pointer"
                  style={{
                    borderRadius: 'var(--r-sm)', background: 'transparent', color: 'var(--brand-gold)',
                    border: '1px solid rgba(212,164,55,0.3)', minWidth: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-gold)'; e.currentTarget.style.color = 'var(--bg-base)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-gold)'; }}
                  aria-label={`${p.name}さんを分析`}
                >
                  分析
                </button>
                <button
                  onClick={() => openSendMessage({ driverName: p.name, userId: p.userId, context: `今週${p.currentWeek}件 (${p.change >= 0 ? '+' : ''}${p.change}%)` })}
                  className="text-xs px-2 py-1.5 font-medium transition-all cursor-pointer"
                  style={{
                    borderRadius: 'var(--r-sm)', background: 'transparent', color: 'var(--brand-crimson)',
                    border: '1px solid rgba(200,16,46,0.3)', minWidth: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-crimson)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-crimson)'; }}
                  aria-label={`${p.name}さんにメッセージを送る`}
                >
                  激励
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-3 pt-3 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setShowAll(!showAll)} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--brand-crimson)' }}>
            {showAll ? '折りたたむ' : `全 ${sorted.length} 名を表示`}
          </button>
        </div>
      )}
    </div>
  );
}
