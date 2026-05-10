'use client';

import { useMemo } from 'react';
import { PLAYERS, WEEKLY_DATA } from '@/src/mockData';
import { useRates } from './RateContext';

interface TickerItem {
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'highlight';
}

export function TickerBar() {
  const { clientRate, driverRates } = useRates();

  const items = useMemo<TickerItem[]>(() => {
    const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
    const prevWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];
    const result: TickerItem[] = [];

    // 今週の合計
    const totalCurrent = PLAYERS.reduce((s, p) => s + (currentWeek[p.name] as number), 0);
    const totalPrev = PLAYERS.reduce((s, p) => s + (prevWeek[p.name] as number), 0);
    const totalChange = Math.round(((totalCurrent - totalPrev) / totalPrev) * 100);
    const revenue = totalCurrent * clientRate;

    result.push({
      text: `今週の配送: ${totalCurrent.toLocaleString()}件 (${totalChange >= 0 ? '+' : ''}${totalChange}%)`,
      type: totalChange >= 0 ? 'positive' : 'negative',
    });

    result.push({
      text: `売上: ¥${(revenue / 10000).toFixed(1)}万`,
      type: 'neutral',
    });

    // 粗利
    const labor = PLAYERS.reduce((s, p) => s + (currentWeek[p.name] as number) * (driverRates[p.name] ?? 160), 0);
    const profit = revenue - labor;
    result.push({
      text: `粗利: ¥${(profit / 10000).toFixed(1)}万`,
      type: profit >= 0 ? 'positive' : 'negative',
    });

    // MVP
    const mvp = PLAYERS.reduce((best, p) => {
      const cur = currentWeek[p.name] as number;
      const bestCur = currentWeek[best.name] as number;
      return cur > bestCur ? p : best;
    });
    const mvpCount = currentWeek[mvp.name] as number;
    result.push({
      text: `MVP: ${mvp.name}さん ${mvpCount}件 — 自己記録更新中`,
      type: 'highlight',
    });

    // 各ドライバーのトピック
    PLAYERS.forEach(p => {
      const cur = currentWeek[p.name] as number;
      const prev = prevWeek[p.name] as number;
      const change = Math.round(((cur - prev) / prev) * 100);

      if (change >= 5) {
        result.push({ text: `${p.name}(${p.character}): ${cur}件 ↑${change}%`, type: 'positive' });
      } else if (change <= -5) {
        result.push({ text: `${p.name}(${p.character}): ${cur}件 ↓${Math.abs(change)}% — 要フォロー`, type: 'negative' });
      }
    });

    // 成長ストーリー
    const firstWeek = WEEKLY_DATA[0];
    PLAYERS.forEach(p => {
      const first = firstWeek[p.name] as number;
      const current = currentWeek[p.name] as number;
      const growth = Math.round(((current - first) / first) * 100);
      if (growth >= 40) {
        result.push({ text: `${p.name}: 5ヶ月で+${growth}%成長（${first}→${current}件）`, type: 'highlight' });
      }
    });

    // 稼働人数
    result.push({
      text: `稼働ドライバー: ${PLAYERS.length}名 — 全員稼働中`,
      type: 'neutral',
    });

    return result;
  }, [clientRate, driverRates]);

  const colorMap = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: 'var(--text-secondary)',
    highlight: '#D4A437',
  };

  const iconMap = {
    positive: '▲',
    negative: '▼',
    neutral: '●',
    highlight: '★',
  };

  // アイテムを3回繰り返してシームレスなループを作る
  const repeated = [...items, ...items, ...items];
  const totalWidth = items.length * 320;
  const duration = items.length * 4;

  return (
    <div className="overflow-hidden" style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      height: '32px',
    }}>
      <div
        className="flex items-center h-full whitespace-nowrap ticker-scroll"
        style={{
          animation: `ticker ${duration}s linear infinite`,
          width: `${totalWidth * 3}px`,
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs flex-shrink-0"
            style={{ color: colorMap[item.type], minWidth: '280px' }}>
            <span className="text-[8px]">{iconMap[item.type]}</span>
            {item.text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalWidth}px); }
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
