'use client';

import { useMessage } from './MessageContext';
import { useRates } from './RateContext';
import { WEEKLY_DATA, getDriverAdvice, type PlayerProfile } from '@/src/mockData';

interface DriverCardProps {
  player: PlayerProfile;
  currentWeek: number;
  change: number;
  monthlyTotal: number;
  badge: string;
}

function MiniChart({ data, trend, id }: { data: number[]; trend: 'up' | 'down' | 'flat'; id: string }) {
  const w = 200, h = 56;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 4;
  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }));
  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${lineD} L${w},${h} L0,${h} Z`;
  const color = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280';
  const gradId = `mini-${id}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: '56px' }} role="img" aria-label={`${id}の推移`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} />
    </svg>
  );
}

export function DriverCard({ player, currentWeek, change, monthlyTotal, badge }: DriverCardProps) {
  const { openSendMessage, openAnalysis } = useMessage();
  const { driverRates, clientRate } = useRates();
  const weeklyData = WEEKLY_DATA.map(w => w[player.name] as number);
  const trend = change >= 3 ? 'up' as const : change <= -3 ? 'down' as const : 'flat' as const;
  const rate = driverRates[player.name] ?? 160;
  const earnings = currentWeek * rate;
  const monthlyEarnings = monthlyTotal * rate;
  const advice = getDriverAdvice(change, player.character);

  return (
    <div className="card p-4 flex flex-col gap-3 transition-transform" style={{ cursor: 'default' }}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 flex items-center justify-center text-sm font-bold"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--brand-crimson-soft)', color: 'var(--brand-crimson)' }}>
            {player.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{player.name}</span>
              <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{player.character}</span>
            </div>
            <span className="text-[10px] num" style={{ color: 'var(--text-muted)' }}>¥{rate}/個</span>
          </div>
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 font-medium" style={{
            borderRadius: 'var(--r-sm)',
            background: badge === 'MVP' ? 'var(--brand-gold-soft)' : badge === '要フォロー' ? 'var(--negative-soft)' : 'var(--warning-soft)',
            color: badge === 'MVP' ? 'var(--brand-gold)' : badge === '要フォロー' ? 'var(--negative)' : 'var(--warning)',
          }}>{badge}</span>
        )}
      </div>

      {/* 数値 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentWeek}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>件/週</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="num text-xs" style={{ color: 'var(--text-muted)' }}>累計 {monthlyTotal.toLocaleString()}件</span>
            <span className="num text-xs font-semibold"
              style={{ color: change >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="num text-sm font-bold" style={{ color: 'var(--brand-gold)' }}>¥{earnings.toLocaleString()}</p>
          <p className="num text-xs" style={{ color: 'var(--text-muted)' }}>売上 ¥{(currentWeek * clientRate).toLocaleString()}</p>
        </div>
      </div>

      {/* チャート */}
      <MiniChart data={weeklyData} trend={trend} id={player.name} />

      {/* AIアドバイス */}
      <div className="p-3" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{advice.summary}</p>
        <div className="flex items-start gap-1.5 mt-1.5">
          <div className="w-0.5 h-full min-h-[16px] flex-shrink-0 rounded-full mt-0.5" style={{ background: 'var(--brand-crimson)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{advice.action}</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2">
        <button
          onClick={() => openAnalysis({
            driverName: player.name,
            userId: player.userId,
          })}
          className="flex-1 text-xs py-2.5 font-medium cursor-pointer transition-all"
          style={{
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-elevated)',
            color: 'var(--brand-gold)',
            border: '1px solid rgba(212,164,55,0.3)',
            minHeight: '44px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-gold)'; e.currentTarget.style.color = 'var(--bg-base)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--brand-gold)'; }}
        >
          AI分析
        </button>
        <button
          onClick={() => openSendMessage({
            driverName: player.name,
            userId: player.userId,
            context: advice.action,
          })}
          className="flex-1 text-xs py-2.5 font-medium cursor-pointer transition-all"
          style={{
            borderRadius: 'var(--r-md)',
            background: 'transparent',
            color: 'var(--brand-crimson)',
            border: '1px solid rgba(200,16,46,0.3)',
            minHeight: '44px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-crimson)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-crimson)'; }}
        >
          メッセージ
        </button>
      </div>
    </div>
  );
}
