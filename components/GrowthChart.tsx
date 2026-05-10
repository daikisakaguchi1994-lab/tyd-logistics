'use client';

import { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { PlayerProfile, WeeklyData } from '@/src/mockData';

interface GrowthChartProps {
  data: WeeklyData[];
  players: PlayerProfile[];
}

const CRIMSON = '#C8102E';
const GOLD = '#D4A437';
const GRAY_SHADES = ['#6B7280', '#9CA3AF', '#4B5563', '#374151', '#a3a3a3', '#737373', '#525252', '#8B8B8B', '#5C5C5C'];
const SURFACE = '#11162A';

export function GrowthChart({ data, players }: GrowthChartProps) {
  const lastWeek = data[data.length - 1];
  const defaultMvp = players.reduce((best, p) =>
    (lastWeek[p.name] as number) > (lastWeek[best.name] as number) ? p : best
  );
  const [highlighted, setHighlighted] = useState(defaultMvp.name);

  const dataWithAvg = data.map(week => {
    const values = players.map(p => week[p.name] as number);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { ...week, '平均': avg };
  });

  const overallAvg = Math.round(
    dataWithAvg.reduce((s, w) => s + (w['平均'] as number), 0) / dataWithAvg.length
  );

  return (
    <div className="card p-5 h-full" role="img" aria-label={`配送件数推移グラフ。主役: ${highlighted}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-bold text-primary">配送件数推移</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {players.map((p, i) => {
            const isActive = p.name === highlighted;
            const color = isActive ? CRIMSON : GRAY_SHADES[i % GRAY_SHADES.length];
            return (
              <button
                key={p.name}
                onClick={() => setHighlighted(p.name)}
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                style={{ opacity: isActive ? 1 : 0.5 }}
                aria-label={`${p.name}を主役に切替`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: color,
                    boxShadow: isActive ? `0 0 8px ${CRIMSON}` : 'none',
                    transition: 'all 200ms',
                  }}
                />
                <span
                  className="text-[10px] sm:text-xs"
                  style={{
                    color: isActive ? '#F5F5F7' : '#6B7280',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 200ms',
                  }}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
          <div className="flex items-center gap-1" style={{ opacity: 0.5 }}>
            <div className="w-3 border-t border-dashed" style={{ borderColor: GOLD }} />
            <span className="text-[10px] sm:text-xs" style={{ color: '#6B7280' }}>平均</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dataWithAvg} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="crimsonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CRIMSON} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CRIMSON} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={true} vertical={false} stroke="#F5F5F7" strokeOpacity={0.05} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1A2138',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#F5F5F7',
              boxShadow: '0 16px 48px rgba(0,0,0,0.48)',
            }}
            itemStyle={{ fontVariantNumeric: 'tabular-nums' }}
            labelStyle={{ color: '#6B7280', fontWeight: 600, marginBottom: 4 }}
            cursor={{ stroke: 'rgba(255,255,255,0.10)', strokeWidth: 1 }}
            formatter={(value: unknown, name: unknown) => {
              const n = String(name);
              if (n !== highlighted && n !== '平均') return [null, null];
              const color = n === highlighted ? CRIMSON : GOLD;
              return [<span key={n} style={{ color }}>{String(value)}件</span>, n];
            }}
          />

          <ReferenceLine y={overallAvg} stroke={GOLD} strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.5} />

          {players.filter(p => p.name !== highlighted).map((p, i) => (
            <Line
              key={p.name}
              type="monotone"
              dataKey={p.name}
              stroke={GRAY_SHADES[i % GRAY_SHADES.length]}
              strokeWidth={1}
              strokeOpacity={0.4}
              dot={false}
              activeDot={false}
            />
          ))}

          <Area
            type="monotone"
            dataKey={highlighted}
            stroke={CRIMSON}
            strokeWidth={2.5}
            fill="url(#crimsonGrad)"
            dot={{ r: 3, fill: SURFACE, stroke: CRIMSON, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: CRIMSON, stroke: SURFACE, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
